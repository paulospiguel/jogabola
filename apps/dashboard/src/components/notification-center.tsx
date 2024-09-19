"use client";
import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import { Bell, Calendar as CalendarIcon, File, Image, Plus, Trash2 } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import { format } from "date-fns";
import { useState } from "react";

// Mock data for initial notifications
const initialNotifications = [
	{
		id: 1,
		title: "Team Meeting",
		content: "Reminder: Team meeting at 2 PM in Conference Room A.",
		datetime: "2023-07-15T14:00:00",
		category: "General",
		attachment: null,
	},
	{
		id: 2,
		title: "New Project Kickoff",
		content: "We're starting a new project next week. Please review the attached document.",
		datetime: "2023-07-20T09:00:00",
		category: "Projects",
		attachment: { type: "file", name: "project_brief.pdf" },
	},
	{
		id: 3,
		title: "Office Closure",
		content: "The office will be closed on July 4th for Independence Day.",
		datetime: "2023-07-04T00:00:00",
		category: "Announcements",
		attachment: null,
	},
];

type NotificationCenterProps = {
	className?: string;
};

export default function NotificationCenter({ className }: NotificationCenterProps) {
	const [notifications, setNotifications] = useState(initialNotifications);
	const [newNotification, setNewNotification] = useState({
		title: "",
		content: "",
		datetime: new Date(),
		category: "",
		attachment: null,
	});

	const handleCreateNotification = () => {
		const notification = {
			id: notifications.length + 1,
			...newNotification,
			datetime: newNotification.datetime.toISOString(),
		};
		setNotifications([...notifications, notification]);
		setNewNotification({
			title: "",
			content: "",
			datetime: new Date(),
			category: "",
			attachment: null,
		});
	};

	const handleDeleteNotification = (id: number) => {
		setNotifications(notifications.filter((notification) => notification.id !== id));
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setNewNotification({
				...newNotification,
				attachment: { type: file.type.startsWith("image/") ? "image" : "file", name: file.name },
			});
		}
	};

	return (
		<Card className={cn("w-full max-w-4xl mx-auto", className)}>
			<CardHeader>
				<CardTitle className="text-2xl font-bold flex items-center">
					<Bell className="mr-2" />
					Notification Center
				</CardTitle>
				<CardDescription>Manage and create notifications for your team</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4 px-2 h-[45vh] overflow-auto">
					{notifications
						.map((notification) => (
							<Card key={notification.id}>
								<CardHeader>
									<CardTitle className="text-lg flex items-center justify-between">
										{notification.title}
										<Button variant="ghost" size="icon" onClick={() => handleDeleteNotification(notification.id)}>
											<Trash2 className="h-4 w-4" />
										</Button>
									</CardTitle>
									<CardDescription>
										{format(new Date(notification.datetime), "PPpp")} - {notification.category}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p>{notification.content}</p>
									{notification.attachment && (
										<div className="mt-2 flex items-center">
											{notification.attachment.type === "image" ? (
												<Image className="h-4 w-4 mr-2" />
											) : (
												<File className="h-4 w-4 mr-2" />
											)}
											<span>{notification.attachment.name}</span>
										</div>
									)}
								</CardContent>
							</Card>
						))
						.reverse()}
				</div>
			</CardContent>
			<CardFooter>
				<Dialog>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Create New Notification
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create New Notification</DialogTitle>
							<DialogDescription>
								Fill in the details for your new notification. Click save when you're done.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="title" className="text-right">
									Title
								</Label>
								<Input
									id="title"
									value={newNotification.title}
									onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="content" className="text-right">
									Content
								</Label>
								<Textarea
									id="content"
									value={newNotification.content}
									onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="category" className="text-right">
									Category
								</Label>
								<Select onValueChange={(value) => setNewNotification({ ...newNotification, category: value })}>
									<SelectTrigger className="col-span-3">
										<SelectValue placeholder="Select a category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="General">General</SelectItem>
										<SelectItem value="Projects">Projects</SelectItem>
										<SelectItem value="Announcements">Announcements</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="datetime" className="text-right">
									Date & Time
								</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant={"outline"}
											className={cn(
												"col-span-3 justify-start text-left font-normal",
												!newNotification.datetime && "text-muted-foreground",
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{newNotification.datetime ? format(newNotification.datetime, "PPpp") : <span>Pick a date</span>}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={newNotification.datetime}
											onSelect={(date) => date && setNewNotification({ ...newNotification, datetime: date })}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="file" className="text-right">
									Attachment
								</Label>
								<Input id="file" type="file" onChange={handleFileChange} className="col-span-3" />
							</div>
						</div>
						<DialogFooter>
							<Button onClick={handleCreateNotification}>Save Notification</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardFooter>
		</Card>
	);
}
