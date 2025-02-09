"use client";
import React from "react";
import { useToast } from "@/components/ui/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

type Notification = {
  id: number;
  title: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
};

type PushNotificationsProps = {
  notifications: Notification[];
};

const PushNotifications = ({ notifications }: PushNotificationsProps) => {
  const { toast } = useToast();

  const showNotification = (notification: Notification) => {
    const { title, message, priority } = notification;

    const options = {
      //position: toast.POSITION.TOP_RIGHT,
      // autoClose: priority === "URGENT" ? 10000 : 5000,
      // style: {
      // 	backgroundColor: priority === "URGENT" ? "#ff4d4f" : priority === "HIGH" ? "#ffa726" : "#4caf50",
      // 	color: "white",
      // },
      id: notification.id,
      title: title,
      description: message,
      action: <ToastAction altText="Mask as seen">Try again</ToastAction>,
    };

    // Exibe a notificação com título e mensagem
    toast(options);
  };

  // Dispara notificações para cada item na lista
  React.useEffect(() => {
    notifications.forEach(showNotification);
  }, [notifications]);

  return (
    <div>
      <Toaster />
    </div>
  );
};

export default PushNotifications;
