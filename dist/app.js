"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const facualty_routes_1 = __importDefault(require("./routes/facualty.routes"));
const app = (0, express_1.default)();
// MIDDLEWARES
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
// ROUTES
//Students Routes
app.use("/student", student_routes_1.default);
// Facualty Routes
app.use("/faculty", facualty_routes_1.default);
// HEALTH CHECK ROUTE
app.get("/", (req, res) => {
    res.send("Attendance Backend Running 🚀");
});
exports.default = app;
