/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const AOSProvider =({ children }: any) => {
    useEffect(() => {
        AOS.init();
    }, []);

    return <Fragment>{children}</Fragment>
}

export default AOSProvider;