import React from "react"
import HeroImage from "../assets/images/Hero.png"
import { useNavigate } from "react-router-dom"

const Home = () => {
  const textLines = [
    "Step into the  ",
    "world of strategy,  ",
    "fun, and financial mastery-",
    "play, learn, and conquer!",
  ]

  const navigate = useNavigate()

  return (
    <div className="overflow-hidden w-full h-full bg-gradient-to-r from-orange-500 to-orange-600">
      <div className="w-full h-full bg-transparent flex flex-col lg:flex-row items-center justify-between px-20 relative">
        <div className="z-10 flex flex-col gap-6 gap-y-12 w-full justify-center h-full lg:w-3/4">
          <h1 className="tracking-wide text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-bold text-orange-800 font-nunito-sans max-w-[900px]">
            {textLines.map((line) => {
              return (
                <p key={line}>
                  {line.split(" ").map((word) => {
                    return (
                      <span
                        key={word}
                        className={`${
                          word.includes("strategy") ||
                          word.includes("fun") ||
                          word.includes("financial") ||
                          word.includes("mastery")
                            ? "text-green-800 hover:text-green-950"
                            : ""
                        }  ${
                          word.includes("play") ||
                          word.includes("learn") ||
                          word.includes("conquer")
                            ? "text-red-900 hover:text-red-950"
                            : ""
                        } hover:text-orange-950 font-[700]`}
                      >
                        {word}{" "}
                      </span>
                    )
                  })}
                  <br />
                </p>
              )
            })}
          </h1>
          <button
            className=" bg-orange-600 text-3xl  lg:px-6 lg:py-2  xl:px-8 xl:py-4 font-nunito-sans rounded-full w-64 border-[4px]  border-gray-200  text-gray-50  hover:text-gray-200  font-bold  transition-all  duration-300  hover:bg-orange-600  hover:scale-110"
            onClick={() => {
              navigate("/game")
            }}
          >
            <p className="font-bold">Play Game </p>
          </button>
        </div>

        <div className="relative z-0 lg:w-1/4 ">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(circle, rgba(169, 169, 169, 0.7), rgba(169, 169, 169, 0.2))",
            }}
          ></div>

          <img
            src={HeroImage}
            className="transform rotate-12 w-full h-auto object-cover opacity-40 transition-all duration-300 hover:scale-110 hover:rotate-6 hover:opacity-65"
          />
        </div>
      </div>
    </div>
  )
}

export default Home
