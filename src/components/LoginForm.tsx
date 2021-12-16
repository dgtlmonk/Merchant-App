// import { client } from "@/helpers/api-client";
import { FormProps, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/material-ui";
import { client } from "../helpers/api-client";

const host =
  "http://d4b2-2404-3c00-482e-99c0-5d39-e26c-8a0a-2dbd.ngrok.io/api/users/login";

export const schema = {
  title: "",
  type: "object",
  required: ["email", "password"],
  properties: {
    email: {
      title: "email",
      type: "string",
    },
    password: {
      title: "password",
      type: "string",
    },
  },
};

const uiSchema = {
  password: {
    "ui:widget": "password",
  },
};

type Props = {
  onSuccess: () => void;
};

export default ({ onSuccess }: Props) => {
  const Form = withTheme(Theme);

  function handleSubmit(
    { formData }: FormProps<any>,
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    // setState({ ...state, loggingIn: true });
    client
      .post(host, {
        body: JSON.stringify(formData),
      })
      .then((res) => {
        if (res.error) {
          console.log(" Login failed");
          return;
        }

        onSuccess();
      });
  }

  return (
    <div className="flex flex-col p-12 items-center justify-center max-w-md h-full">
      <Form
        uiSchema={uiSchema}
        //  @ts-ignore
        schema={schema}
        onSubmit={handleSubmit}
        key="loginForm"
      >
        <button
          type="submit"
          key="loginButton"
          className="p-2 mt-4 rounded-md w-full bg-blue-400 text-white font-medium"
        >
          Login
        </button>
      </Form>
    </div>
  );
};
