import Image from "next/image";
import LoginSocialButton from "./login-social-button";

import { GoogleIcon } from "@repo/ui/icons";
import apple from "@repo/ui/icons/apple.svg";
import discord from "@repo/ui/icons/discord.svg";
// import telegram from "@repo/ui/icons/telegram.svg";
import twitterx from "@repo/ui/icons/twitterx.svg";

const SocialLogin = () => {
	const callbackUrl = `${process.env.NEXT_PUBLIC_URL}`;
	return (
		<div className="flex w-ful justify-center items-center p-2 space-x-2 ">
			<LoginSocialButton provider="google" callbackUrl={callbackUrl}>
				<GoogleIcon />
			</LoginSocialButton>
			<LoginSocialButton provider="twitter" callbackUrl={callbackUrl}>
				<Image src={twitterx} alt="twitterx" width={28} height={28} />
			</LoginSocialButton>
			{/* <LoginSocialButton provider="telegram" callbackUrl={callbackUrl}>
				<Image src={telegram} alt="telegram" width={28} height={28} />
			</LoginSocialButton> */}
			<LoginSocialButton provider="discord" callbackUrl={callbackUrl}>
				<Image src={discord} alt="discord" width={28} height={28} />
			</LoginSocialButton>
			<LoginSocialButton provider="apple" callbackUrl={callbackUrl}>
				<Image src={apple} alt="apple" width={28} height={28} />
			</LoginSocialButton>
		</div>
	);
};

export default SocialLogin;
