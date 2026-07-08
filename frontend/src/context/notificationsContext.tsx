import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './webSocketContext';
import { apiRequest } from '../api/ApiRequest';

export type NotificationType = 'FRIEND_REQUEST' | 'UNREAD_MESSAGES' | 'FRIEND_REQUEST_ACCEPTED';

export interface NotificationPayload {
    id?: number | string;
    username?: string;
    room_id?: number | string;
    unread_count?: number;
    status?: string;
    [key: string]: any;
}

export interface Notification {
    id: string | number;
    type: NotificationType;
    payload: NotificationPayload;
    createdAt?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    clearRoomNotifications: (roomId: number | string) => void;
    markAsRead: (notificationId: string | number) => void;
}

interface AuthUser {
    id: string;
    login?: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const fetchInitialNotifications = async (updateNotifications: (data: Notification[]) => void) => {
    try {
        const data = await apiRequest({
            endpoint: 'notifications',
            method: 'GET',
        });

        if (data && Array.isArray(data)) {
            updateNotifications(data);
        } else if (data) {
            const notifications = data.notifications || data.data || [];
            if (Array.isArray(notifications)) {
                updateNotifications(notifications);
            } else {
                updateNotifications([]);
            }
        } else {
            updateNotifications([]);
        }
    } catch (error) {
        updateNotifications([]);
    }
};

const updateChatOnServer = async (id: number | null) => {
    if (!id) return;
    try {
        await apiRequest({
            endpoint: 'chat/enter',
            method: 'PUT',
            body: { room_id: id }
        });
    } catch (error) {
        console.error("Error al marcar chat como leído en servidor:", error);
    }
};

export function NotificationProvider({ children, activeChat, user }: { children: React.ReactNode; activeChat: number | null; user: AuthUser | null }) {
    const [ notifications, setNotifications ] = useState<Notification[]>([]);
    const { subscribe } = useWebSocket(); 

    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            return;
        }
        fetchInitialNotifications(setNotifications);
    }, [user?.id]);

    useEffect(() => {
        if (!activeChat) return;
        
        updateChatOnServer(activeChat);

        setNotifications((prev) => {
            const currentNotis = Array.isArray(prev) ? prev : [];
            return currentNotis.filter(
                n => !(n.type === 'UNREAD_MESSAGES' && n.payload?.room_id === activeChat)
            );
        });
    }, [activeChat]);

    useEffect(() => {
        if (!user) return;

        const unsubscribeMessage = subscribe("message", (message: any) => {
            if (!message.room_id) return;
            const roomId = message.room_id;

            setNotifications((prevNotis) => {
                const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];

                if (roomId === activeChat) {
                    updateChatOnServer(roomId);
                    return currentNotis;
                }

                const existingIndex = currentNotis.findIndex(
                    n => n.type === 'UNREAD_MESSAGES' && n.payload?.room_id === roomId
                );

                if (existingIndex !== -1) {
                    const updatedNotis = [...currentNotis];
                    const existing = updatedNotis[existingIndex];
                    const currentCount = existing.payload?.unread_count || 0;

                    updatedNotis[existingIndex] = {
                        ...existing,
                        payload: {
                            ...existing.payload,
                            unread_count: currentCount + 1,
                            room_id: roomId
                        }
                    };
                    return updatedNotis;
                } else {
                    return [
                        {
                            id: `unread_room_${roomId}_${Date.now()}`,
                            type: 'UNREAD_MESSAGES',
                            payload: {
                                room_id: roomId,
                                unread_count: 1,
                                created_at: new Date().toISOString()
                            }
                        },
                        ...currentNotis
                    ];
                }
            });
        });

        const unsubscribeFriendRequest = subscribe("FRIEND_REQUEST", (message: any) => {
            if (!message.payload) return;
            setNotifications((prevNotis) => {
                const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];
                return [
                    {
                        id: message.payload.id || `friend_req_${Date.now()}`,
                        type: 'FRIEND_REQUEST',
                        payload: message.payload,
                        createdAt: new Date().toISOString()
                    },
                    ...currentNotis
                ];
            });
        });

        const unsubscribeFriendAccepted = subscribe("FRIEND_REQUEST_ACCEPTED", (message: any) => {
            if (!message.payload) return;
            setNotifications((prevNotis) => {
                const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];
                return currentNotis.filter(
                    n => !(n.type === 'FRIEND_REQUEST' && n.payload?.id === message.payload?.id)
                );
            });
        });

        return () => {
            unsubscribeMessage();
            unsubscribeFriendRequest();
            unsubscribeFriendAccepted();
        };
    }, [user, activeChat, subscribe]);

    const markAsRead = useCallback((notificationId: string | number) => {
        setNotifications((prevNotis) => {
            const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];
            return currentNotis.filter(n => n.id !== notificationId);
        });
    }, []);

    const clearRoomNotifications = useCallback((roomId: number | string) => {
        setNotifications((prevNotis) => {
            const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];
            return currentNotis.filter(
                n => !(n.type === 'UNREAD_MESSAGES' && n.payload?.room_id === roomId)
            );
        });
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, clearRoomNotifications, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification debe usarse dentro de un NotificationProvider');
    }
    return context;
};