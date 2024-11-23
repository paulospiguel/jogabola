import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { Copy } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

type ShareDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	link: string;
};

export default function ShareDialog({ isOpen, onOpenChange, link }: ShareDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Compartilhar</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="items-center space-y-1">
						<Label htmlFor="link" className="text-right">
							Link
						</Label>
						<div className="flex gap-2 w-full">
							<Input id="link" value={link} className="flex-1 w-full" readOnly />
							<Button
								variant="link"
								onClick={() => {
									navigator.clipboard.writeText(link);
									onOpenChange(false);
								}}
							>
								<Copy className="h-6 w-6" />
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
