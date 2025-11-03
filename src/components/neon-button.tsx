interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {   
    children: React.ReactNode;
}

const NeonButton = ({ children, ...props }: NeonButtonProps) => {
    return (
        <button
            {...props}
            className="relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-transparent bg-gradient-to-br from-[#00cfb1] to-[#1effbf] px-6 py-3 text-lg font-medium text-white shadow-md transition duration-300 hover:shadow-lg"
        >
            {children}
        </button>
    );
};

export default NeonButton;