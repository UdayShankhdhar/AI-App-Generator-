export const config = {
  app: { name: "THE SIGNAL", locale: "en" },
  pages: [
    {
      id: "users",
      title: "Users",
      components: [
        {
          type: "table",
          dataSource: "users",
          columns: ["name", "email", "role"]
        }
      ]
    }
  ]
};