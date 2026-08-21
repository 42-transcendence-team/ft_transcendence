package handlers

import (
	"backend/config"
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"backend/internal/utils"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/go-playground/validator/v10"
	"github.com/redis/go-redis/v9"
)

type AuthHandler struct {
	AuthService *services.AuthService
	Redis       *redis.Client
	cfg         *config.Config
}

func NewAuthHandler(authService *services.AuthService, cfg *config.Config, rdb *redis.Client) *AuthHandler {
	return &AuthHandler{
		AuthService: authService,
		cfg:         cfg,
		Redis:       rdb,
	}
}

/* Register */

/* JSON que manda el fronted
Si algun campo no cumple las reglas de la struct de abajo manda error con especificacioens
de que ha fallado segun la estructura d ela funcon apperr NewValidation()
{
  "login": "prueba",
  "email": "prueba@test.com",
  "password": "angelaKk12132%",
  "confirmPassword": "angelaKk12132%",
  "name": "angela",
  "surname": "barrio",
  "birthday": "2000-10-23" , // tiene que ser este formato "aaaa-mm-dd"
  "termsAndConditions": true,
  "privacyPolicy": true
}
*/

func (h *AuthHandler) Register(c *gin.Context) {

	var req dto.RegisterRequest

	err := ValidationBindRequest(c, &req)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	birthday, err := time.Parse("2006-01-02", req.Birthday)
	if err != nil {
		c.Error(appErr.NewValidation(map[string]string{
			"birthday": "invalid_format",
		}))
		c.Abort()
		return
	}

	user, err := h.AuthService.Register(dto.RegisterInput{
		Login:    req.Login,
		Email:    req.Email,
		Password: req.Password,
		Name:     req.Name,
		Surname:  req.Surname,
		Birthday: birthday,
	})
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	strToken, expTime, err := utils.CreateJwtToken(&user, h.cfg)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	timeExp := time.Until(expTime)
	if timeExp < 0 {
		log.Printf("authHandler: Expired session %v", err)
		c.AbortWithStatusJSON(400, gin.H{"Error": "Expired session"})
		return
	}
	sessionKey := fmt.Sprintf("session:%d", user.ID)
	err = h.Redis.Set(c, sessionKey, strToken, timeExp).Err()
	if err != nil {
		log.Printf("Error: registration redis session")
	}
	h.Redis.SAdd(c, "online_users", user.ID)

	h.setCookie(c, strToken, expTime)

	// TODO: Hay que ver como damos la respuesta al front
	c.JSON(201, gin.H{
		"message": "user created",
		"user": gin.H{
			"login":    user.Login,
			"email":    user.Email,
			"name":     user.Name,
			"surname":  user.Surname,
			"birthday": user.Birthday,
		},
	})
}

/* End of register */

/* Login */

/*
peticion que manda el front
{
	"identifier": "login-or-email"
	"password":	"Uwu&password&strong42"
}
*/

func (h *AuthHandler) Login(c *gin.Context) {

	var req dto.LoginRequest
	err := ValidationBindRequest(c, &req)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	result, err := h.AuthService.Login(dto.LoginInput{
		Identifier: req.Identifier,
		Password:   req.Password,
	})
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	// En el caso de "FA activa, se genera un Roken temporal para poder comprobar el código TOTP
	// Retorna para poder llamar al endpoint/handler de login 2FA
	ctx := c.Request.Context()
	if result.Requires2FA {
		rediskey := fmt.Sprintf("2fa_token:%s", result.TempToken)
		timeExp := time.Until(result.ExpTime)
		if timeExp < 0 {
			log.Printf("authHandler: Expired session %v", err)
			c.AbortWithStatusJSON(401, gin.H{"Error": "Expired session"})
			return
		}
		err := h.Redis.Set(ctx, rediskey, result.User.ID, timeExp).Err()
		if err != nil {
			log.Printf("authHandler: Redis error %v", err)
			c.AbortWithStatusJSON(500, gin.H{"Error": "Server error (redis error)"})
			return
		}
		h.SetTempToken(c, result.TempToken, result.ExpTime)
		c.JSON(200, gin.H{
			"message":     "2FA required",
			"requires2fa": true,
			"user": gin.H{
				"id":        result.User.ID,
				"tempToken": result.TempToken,
			},
		})
		return
	}

	strToken := result.Token
	expTime := result.ExpTime
	user := result.User

	h.setCookie(c, strToken, expTime)
	timeExp := time.Until(expTime)
	if timeExp < 0 {
		log.Printf("authHandler: Expired session %v", err)
		c.AbortWithStatusJSON(400, gin.H{"Error": "Expired session"})
		return
	}
	// ctx := c.Request.Context()
	sessionKey := fmt.Sprintf("session:%d", user.ID)
	err = h.Redis.Set(ctx, sessionKey, strToken, timeExp).Err()
	if err != nil {
		log.Printf("Error: registration redis session")
	}
	h.Redis.SAdd(ctx, "online_users", user.ID)
	// TODO: hay q ver como se mandan los msg al front y que necesita
	c.JSON(200, gin.H{
		"message":     "user login success",
		"requires2fa": false,
		"user": gin.H{
			"id":    user.ID,
			"login": user.Login,
			"email": user.Email,
		},
	})
}

/*End of login*/
/*Logout*/

func (h *AuthHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		log.Println("Logout: userID not found in context")
	}

	ctx := c.Request.Context()
	if exists {
		sessionKey := fmt.Sprintf("session:%v", userID)
		err := h.Redis.Del(ctx, sessionKey).Err() //borramos la session
		if err != nil {
			log.Printf("Error redis session deleted: %v", err)
		}
		errSrem := h.Redis.SRem(ctx, "online_users", userID).Err() //lo borramos de la lista de online_user
		if errSrem != nil {
			log.Printf("Error deleting online user in redis: %v", errSrem)
		}
	}
	expTime := time.Unix(0, 0)
	h.setCookie(c, "", expTime) //matamos la cokie
	log.Printf("session borrada")
	// TODO: hay q ver como se mandan los msg al front y que necesita
	c.JSON(200, gin.H{"message": "user logout success"})

}

func (h *AuthHandler) setCookie(c *gin.Context, strToken string, exp time.Time) {

	var secure bool

	if h.cfg.Env == "prod" {
		secure = true // Solo enviar por HTTPS, para produccion
	} else {
		secure = false // para desarrollo, asi si haces http://localhost:8080 para pruebas funciona
	}

	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    strToken,
		Expires:  exp,  // Expiración
		HttpOnly: true, // Previene acceso por JS (seguridad)
		Secure:   secure,
		SameSite: http.SameSiteLaxMode, // Protección CSRF
		Path:     "/",
	}

	if strToken == "" {
		cookie.MaxAge = -1
	}

	http.SetCookie(c.Writer, cookie)

}

// Se genera un Token temporal para la validacion 2FA. Tiene menos timpo de vida y es mas simple que el bueno
// Solo sirve para ir a la ruta de validacion para login 2FA
func (h *AuthHandler) SetTempToken(c *gin.Context, tempToken string, exp time.Time) {
	var secure bool

	if h.cfg.Env == "prod" {
		secure = true // Solo enviar por HTTPS, para produccion
	} else {
		secure = false // para desarrollo, asi si haces http://localhost:8080 para pruebas funciona
	}

	cookie := &http.Cookie{
		Name:     "tempToken",
		Value:    tempToken,
		Expires:  exp,  // Expiración
		HttpOnly: true, // Previene acceso por JS (seguridad)
		Secure:   secure,
		SameSite: http.SameSiteLaxMode, // Protección CSRF
		Path:     "/",
	}

	if tempToken == "" {
		cookie.MaxAge = -1
	}

	http.SetCookie(c.Writer, cookie)
}

// Un llamador a la funcion de arriba para borrar el Token temporal de las Cookies del usuario
func (h *AuthHandler) ClearTempToken(c *gin.Context) {
	h.SetTempToken(c, "", time.Unix(0, 0))
}

// Redirige al usuario a la URL de autenticacion de 42, que se genera con la funcion Build42AuthURL()
func (h *AuthHandler) Login42(c *gin.Context) {
	authURL := h.AuthService.Build42AuthURL()
	c.Redirect(http.StatusFound, authURL)
}

func (h *AuthHandler) Login42Callback(c *gin.Context) {
	oauthError := c.Query("error")
	if oauthError != "" {
		description := c.Query("error_description")

		log.Printf(
			"42 OAuth rejected: %s (%s)",
			oauthError,
			description,
		)

		c.Redirect(
			http.StatusFound,
			"https://localhost/login?oauth_error=access_denied",
		)
		return
	}

	code := c.Query("code")
	if code == "" {
		c.Error(appErr.NewBadRequest("code query parameter is required"))
		c.Abort()
		return
	}

	token, err := h.AuthService.Exchange42Code(code)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	user42, err := h.AuthService.Get42User(token)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	user, err := h.AuthService.Search42User(user42)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	if user == nil {
		newUser, err := h.AuthService.PreRegister42User(user42)
		if err != nil {
			c.Error(err)
			c.Abort()
			return
		}

		timeExp := time.Duration(5 * time.Minute)
		err = h.Redis.Set(c, "42_register:"+token, newUser, timeExp).Err()
		if err != nil {
			c.Error(err)
			c.Abort()
			return
		}

		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "42_token",
			Value:    token,
			Expires:  time.Now().Add(timeExp),
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteLaxMode,
		})

		c.Redirect(
			http.StatusFound,
			"https://localhost/42register",
		)
		return
	}

	final, err := h.AuthService.Login42User(user)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	ctx := c.Request.Context()
	if final.Requires2FA {
		rediskey := fmt.Sprintf("2fa_token:%s", final.TempToken)
		timeExp := time.Until(final.ExpTime)
		if timeExp < 0 {
			log.Printf("authHandler: Expired session %v", err)
			c.AbortWithStatusJSON(401, gin.H{"Error": "Expired session"})
			return
		}
		err := h.Redis.Set(ctx, rediskey, final.User.ID, timeExp).Err()
		if err != nil {
			log.Printf("authHandler: Redis error %v", err)
			c.AbortWithStatusJSON(500, gin.H{"Error": "Server error (redis error)"})
			return
		}
		h.SetTempToken(c, final.TempToken, final.ExpTime)
		c.Redirect(
			http.StatusFound,
			"https://localhost/login?requires_2fa=true&temp_token="+final.TempToken,
		)
		return
	}

	h.setCookie(c, final.Token, final.ExpTime)
	h.ClearTempToken(c)
	sessionKey := fmt.Sprintf("session:%d", user.ID)
	err = h.Redis.Set(ctx, sessionKey, final.Token, time.Until(final.ExpTime)).Err()
	if err != nil {
		log.Printf("Error: 42 login redis session")
	}
	h.Redis.SAdd(ctx, "online_users", user.ID)
	c.Redirect(
		http.StatusFound,
		"https://localhost/app",
	)
}

func (h *AuthHandler) Get42UserInfo(c *gin.Context) {
	token, err := c.Cookie("42_token")
	if err != nil {
		c.Error(appErr.NewBadRequest("42_token cookie is required"))
		c.Abort()
		return
	}

	data, err := h.Redis.Get(c, "42_register:"+token).Result()
	if err != nil {
		c.Error(appErr.NewInternal(err))
		c.Abort()
		return
	}

	var user dto.Redis42User

	if err := json.Unmarshal([]byte(data), &user); err != nil {
		c.Error(appErr.NewInternal(err))
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) Register42(c *gin.Context) {
	token, err := c.Cookie("42_token")
	if err != nil {
		c.Error(appErr.NewBadRequest("42_token cookie is required"))
		c.Abort()
		return
	}

	var regUser dto.Register42User
	err = ValidationBindRequest(c, &regUser)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	birthday, err := time.Parse("2006-01-02", regUser.Birthday)
	if err != nil {
		c.Error(appErr.NewValidation(map[string]string{
			"birthday": "invalid_format",
		}))
		c.Abort()
		return
	}

	data, err := h.Redis.Get(c, "42_register:"+token).Result()
	if err != nil {
		c.Error(appErr.NewInternal(err))
		c.Abort()
		return
	}

	var redisUser dto.User42
	err = json.Unmarshal([]byte(data), &redisUser)
	if err != nil {
		c.Error(appErr.NewInternal(err))
		c.Abort()
		return
	}

	user, err := h.AuthService.Register42User(&regUser, &redisUser.ID42, birthday)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	// TODO - Crear token de sesion y redirigir al perfil/home
	h.Redis.Del(c, "42_register:"+token)
	c.SetCookie("42_token", "", -1, "/", "localhost", false, true)

	strToken, expTime, err := utils.CreateJwtToken(user, h.cfg)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	timeExp := time.Until(expTime)
	if timeExp < 0 {
		log.Printf("authHandler: Expired session %v", err)
		c.AbortWithStatusJSON(400, gin.H{"Error": "Expired session"})
		return
	}
	sessionKey := fmt.Sprintf("session:%d", user.ID)
	err = h.Redis.Set(c, sessionKey, strToken, timeExp).Err()
	if err != nil {
		log.Printf("Error: registration redis session")
	}
	h.Redis.SAdd(c, "online_users", user.ID)

	h.setCookie(c, strToken, expTime)
	c.JSON(http.StatusOK, gin.H{"message": "42 registration successful", "user": user})
}
