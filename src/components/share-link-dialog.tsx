import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ShareDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  link: string;
};

export default function ShareDialog({
  isOpen,
  onOpenChange,
  link,
}: ShareDialogProps) {
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
            <div className="flex w-full gap-2">
              <Input
                id="link"
                value={link}
                className="w-full flex-1"
                readOnly
              />
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
