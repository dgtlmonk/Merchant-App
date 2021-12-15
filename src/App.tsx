import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/material-ui";

// import JSONSchemaForm from "react-jsonschema-form";

const Form = withTheme(Theme);

function App() {
  const schema = {
    type: "object",
    required: ["familyName"],
    properties: {
      name: {
        title: "",
        type: "object",
        required: ["givenName", "familyName"],
        properties: {
          givenName: {
            title: "given name",
            type: "string",
          },
          familyName: {
            title: "family name",
            type: "string",
          },
        },
      },
    },
  };

  return (
    <div style={{ padding: "2em" }}>
      <Form schema={schema} onSubmit={({ formData }) => console.log(formData)}>
        <button type="submit">Next</button>
      </Form>
    </div>
  );
}

export default App;
