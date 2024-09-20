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

type ModalProps = {
	triggerComponent: React.ReactNode;
	content: React.ReactNode;
	title: string;
	description?: string;
	footer?: ComponentProps<typeof DialogFooter>["children"];
};

export const Modal: FC<ModalProps> = forwardRef(({ triggerComponent, content, title, description, footer }, ref) => {
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
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>{description}</DialogDescription>
					</DialogHeader>
					{content}
					<DialogFooter>{footer}</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
});
