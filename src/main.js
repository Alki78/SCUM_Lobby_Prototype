import "./styles/base.css";
import "./styles/components/navigation.css";
import "./styles/pages/shop.css";
import "./styles/pages/home.css";
import "./styles/pages/home-illustrations.css";
import "./styles/pages/home-icons.css";
import "./styles/pages/solo.css";
import { registerLegacyHandlers } from "./runtime/legacy-handlers.js";
import { render } from "./navigation.js";

registerLegacyHandlers();
render();
