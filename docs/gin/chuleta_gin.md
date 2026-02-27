## 1. Flujo de una petición HTTP en Gin

```
Client
  │
  ▼
[ TCP Connection ]
  │
  ▼
[ HTTP Parser ]  ← Go's net/http lee headers, method, path, body
  │
  ▼
[ Gin Router ]   ← matchea la ruta contra el árbol de rutas (radix tree)
  │
  ▼
┌─────────────────────────────────────┐
│         Handler Chain               │
│                                     │
│  Middleware 1 (pre)                 │
│      ↓ c.Next()                     │
│  Middleware 2 (pre)                 │
│      ↓ c.Next()                     │
│  Handler final                      │
│      ↓ return                       │
│  Middleware 2 (post)                │
│      ↓ return                       │
│  Middleware 1 (post)                │
└─────────────────────────────────────┘
  │
  ▼
[ ResponseWriter ] ← escribe al socket TCP
  │
  ▼
Client recibe respuesta
```

Si algún middleware llama `c.Abort()`, la cadena se corta — los siguientes índices no se ejecutan, pero el código **después** del `c.Next()` en middlewares anteriores sí sigue.

---

## 2. Tabla completa de funciones Gin

### Engine / Router
| Función | Descripción |
|---|---|
| `gin.New()` | Engine sin middleware |
| `gin.Default()` | Engine con Logger + Recovery |
| `r.Run(addr)` | Arranca servidor |
| `r.RunTLS(addr, cert, key)` | Arranca con TLS |
| `r.GET/POST/PUT/DELETE/PATCH/HEAD/OPTIONS(path, handlers...)` | Registra ruta |
| `r.Any(path, handlers...)` | Registra todos los métodos |
| `r.Static(path, root)` | Sirve archivos estáticos |
| `r.StaticFile(path, file)` | Sirve un archivo específico |
| `r.NoRoute(handlers...)` | Handler para 404 |
| `r.NoMethod(handlers...)` | Handler para 405 |
| `r.Group(path)` | Crea subgrupo de rutas |
| `r.Use(middleware...)` | Aplica middleware global |
| `r.SetTrustedProxies([]string)` | Define proxies confiables |

### RouterGroup
| Función | Descripción |
|---|---|
| `g.Group(path)` | Sub-grupo anidado |
| `g.Use(middleware...)` | Middleware scoped al grupo |
| `g.GET/POST/...` | Igual que en Engine |

### Request Parsing — `c.*`
| Función | Descripción |
|---|---|
| `c.Param(key)` | Path param → `/user/:id` |
| `c.Query(key)` | Query string → `?foo=bar` |
| `c.DefaultQuery(key, default)` | Query con fallback |
| `c.PostForm(key)` | Form field |
| `c.DefaultPostForm(key, default)` | Form field con fallback |
| `c.GetRawData()` | Body crudo como `[]byte` |
| `c.ShouldBindJSON(&obj)` | Deserializa JSON, retorna error |
| `c.ShouldBindQuery(&obj)` | Bind query params a struct |
| `c.ShouldBindUri(&obj)` | Bind path params a struct |
| `c.ShouldBind(&obj)` | Bind según Content-Type |
| `c.BindJSON(&obj)` | Como ShouldBind pero hace Abort en error |
| `c.MultipartForm()` | Form multipart completo |
| `c.FormFile(key)` | Archivo subido |
| `c.SaveUploadedFile(file, dst)` | Guarda archivo en disco |

### Response Helpers — `c.*`
| Función | Descripción |
|---|---|
| `c.JSON(code, obj)` | Responde JSON |
| `c.IndentedJSON(code, obj)` | JSON con indentación |
| `c.XML(code, obj)` | Responde XML |
| `c.YAML(code, obj)` | Responde YAML |
| `c.String(code, format, vals...)` | Responde texto plano |
| `c.HTML(code, template, data)` | Renderiza template HTML |
| `c.File(path)` | Sirve archivo |
| `c.FileAttachment(path, name)` | Descarga de archivo |
| `c.Redirect(code, url)` | Redirect HTTP |
| `c.Data(code, contentType, data)` | Bytes crudos |
| `c.Stream(step func(w io.Writer) bool)` | Streaming response |
| `c.SSEvent(name, message)` | Server-Sent Events |
| `c.Status(code)` | Solo escribe status code |
| `c.Header(key, value)` | Escribe header de respuesta |

### Middleware / Chain Control — `c.*`
| Función | Descripción |
|---|---|
| `c.Next()` | Ejecuta el siguiente handler |
| `c.Abort()` | Corta la cadena |
| `c.AbortWithStatus(code)` | Corta + status code |
| `c.AbortWithStatusJSON(code, obj)` | Corta + JSON |
| `c.AbortWithError(code, err)` | Corta + error interno |
| `c.IsAborted()` | Verifica si fue abortado |

### Context Store — `c.*`
| Función | Descripción |
|---|---|
| `c.Set(key, value)` | Guarda valor en el request |
| `c.Get(key)` | Lee valor → `(any, bool)` |
| `c.MustGet(key)` | Lee valor → panic si no existe |
| `c.GetString(key)` | Lee como string |
| `c.GetInt(key)` | Lee como int |
| `c.GetBool(key)` | Lee como bool |

### Request Metadata — `c.*`
| Función | Descripción |
|---|---|
| `c.Request` | `*http.Request` original |
| `c.Writer` | `gin.ResponseWriter` |
| `c.ClientIP()` | IP del cliente |
| `c.ContentType()` | Content-Type del request |
| `c.GetHeader(key)` | Lee header de request |
| `c.IsWebsocket()` | Detecta upgrade WS |
| `c.FullPath()` | Ruta registrada con params |
| `c.HandlerName()` | Nombre del handler actual |
| `c.Error(err)` | Adjunta error sin abortar |
| `c.Errors` | Slice de errores adjuntos |
| `c.Copy()` | Copia del contexto para goroutines |
