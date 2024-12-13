import { useRouteError } from "react-router-dom"

const Error = () => {
  const err = useRouteError()
  return (
    <div>
      <h3>
        {" "}
        {err.status} : {err.statusText}{" "}
      </h3>
      Page not found&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <a href="/">Go to home page </a>
    </div>
  )
}

export default Error
