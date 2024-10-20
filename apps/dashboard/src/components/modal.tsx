"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import { type ComponentProps, type FC, forwardRef, useImperativeHandle, useRef, useState } from "react";

const widthSize = {
	small: "max-w-sm",
	medium: "max-w-lg ",
	large: "max-w-7xl",
	full: "max-w-full md:max-w-[calc(100vw-2rem)]",
};

type ModalProps = {
	triggerComponent: React.ReactNode;
	content: React.ReactNode;
	title: string;
	description?: string;
	footer?: ComponentProps<typeof DialogFooter>["children"];
	size?: keyof typeof widthSize;
};

export const Modal: FC<ModalProps> = forwardRef(
	({ size = "medium", triggerComponent, content, title, description, footer }, ref) => {
		const [isOpen, setIsOpen] = useState(false);
		const modalRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => ({
			open: () => setIsOpen(true),
			close: () => setIsOpen(false),
		}));

		return (
			<div ref={modalRef}>
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>{triggerComponent}</DialogTrigger>
					<DialogContent className={widthSize[size]}>
						{(title || description) && (
							<DialogHeader>
								<DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
								<DialogDescription>{description}</DialogDescription>
							</DialogHeader>
						)}
						{content}
						{footer && <DialogFooter>{footer}</DialogFooter>}
					</DialogContent>
				</Dialog>
			</div>
		);
	},
);
