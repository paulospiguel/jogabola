import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Logo } from "../logo";

interface AuthCardProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
}

const AuthCard = ({ title, description, children }: AuthCardProps) => {
	return (
		<Card className="mx-auto max-w-sm min-w-[680px] shadow-md">
			<CardHeader className="text-center">
				<Logo className="mx-auto" />
				{title && <CardTitle className="text-2xl">{title}</CardTitle>}
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
};

export default AuthCard;
