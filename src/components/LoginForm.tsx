import { TextField } from "@material-ui/core";

export default () => (
  <div className="flex flex-col p-12 items-center justify-center max-w-md h-full">
    <div className="flex justify-center mb-6 w-full">
      <TextField label="username" />
    </div>
    <div className="flex justify-center mb-6">
      <TextField label="password" />
    </div>
    <button className="p-2 mt-4 border rounded-md w-full bg-blue-400 text-white font-medium">
      Login
    </button>
  </div>
);
