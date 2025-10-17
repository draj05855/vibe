import { useState , useEffect } from "react";

export const useScroll = (threeshold = 10 ) => {
    const [isScrolled , setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > threeshold);
        }

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll" , handleScroll);

    },[threeshold])
    return isScrolled;
}