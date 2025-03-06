import React from "react";
import IconSearch from "../icon/IconSearch";

interface Props {}

const Search = (props: Props) => {
  return (
    <div className="h-screen bg-gray-300 px-2">
      <div className="max-w-md mx-auto rounded-lg overflow-hidden md:max-w-xl">
        <div className="md:flex">
          <div className="w-full p-3">
            <div className="relative">
              <IconSearch />
              <input
                type="text"
                className="bg-white h-14 w-full px-12 rounded-lg focus:outline-none hover:cursor-pointer"
              />
              <span className="absolute top-4 right-5 border-l pl-4">
                <i className="fa fa-microphone text-gray-500 hover:text-green-500 hover:cursor-pointer" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
