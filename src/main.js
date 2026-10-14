import "./styles/base.css";
import "./styles/components/navigation.css";
import "./styles/pages/shop.css";
import "./styles/pages/home.css";
import { registerLegacyHandlers } from "./runtime/legacy-handlers.js";
import { render } from "./navigation.js";

registerLegacyHandlers();
render();
