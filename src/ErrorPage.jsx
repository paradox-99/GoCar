import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {

    const error = useRouteError();

    return (
        <div id="error-page" className="flex flex-col gap-10 items-center justify-center h-screen text-center">
            <div className="flex flex-col items-center justify-center">
                <img src="/error.png" alt="Error image" className="h-[500px] "/>
                <h1 className="font-font_playFira text-6xl font-bold mb-4 text-colorPrimary">Oops!</h1>
                <p className="font-font_work-sans text-2xl font-medium my-2 text-colorParagraph">Sorry, an unexpected error has occurred.</p>
                <p className="text-xl font-font_work-sans font-medium">
                    <i>{error.statusText || error.message}</i>
                </p>
            </div>
            <Link to={'/'} className="btn btn-primary text-lg text-white">Back to Home</Link>
        </div>
    );
}

export default ErrorPage;