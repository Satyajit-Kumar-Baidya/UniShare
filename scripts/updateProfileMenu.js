
const fs = require("fs");
const path = "frontend/src/components/ProfileMenu.tsx";
let code = fs.readFileSync(path, "utf-8");

code = code.replace("to=\\"/profile?tab=overview\\"", "to=\\"/profile\\"");
code = code.replace("to=\\"/profile?tab=settings\\"", "to=\\"/dashboard/settings\\"");

fs.writeFileSync(path, code);

