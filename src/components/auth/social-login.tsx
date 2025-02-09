import Image from "next/image";
import LoginSocialButton from "./login-social-button";

import { GoogleIcon } 
import apple from "@/components/icons/apple.svg";
import discord from "@/components/icons/discord.svg";
// import telegram from "@/components/icons/telegram.svg";
import twitterx from "@/components/icons/twitterx.svg";

const SocialLogin = () => {
  const callbackUrl = `${process.env.NEXT_PUBLIC_URL}`;
  return (
    <div className="w-ful flex items-center justify-center space-x-2 p-2">
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
