import { PropagateLoader } from "react-spinners";

const Loader = () => {
     return (
          <div className="w-full h-[600px] flex justify-center items-center">
               <PropagateLoader
                    color="#ff802c"
                    loading
                    size={20}
               />
          </div>
     );
};

export default Loader;