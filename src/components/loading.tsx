

import ballLoading from "@/assets/animations/ball-loading.gif"
import Image from "next/image";

const Loading = () => {
  return <div className="w-full mx-auto flex flex-col items-center justify-center p-2">
    <Image src={ballLoading} alt="alt" width={100} height={100} />
    <span>Loading</span>
  </div>;
};

export default Loading;
