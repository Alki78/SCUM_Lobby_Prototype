import { state } from "../state.js";
import * as navigation from "../navigation.js";
import * as home from "../pages/home.js";
import * as solo from "../pages/solo.js";
import * as multiplayer from "../pages/multiplayer.js";
import * as options from "../pages/options.js";
import * as shop from "../pages/shop.js";
import * as infos from "../pages/infos.js";
import * as credits from "../pages/credits.js";
import * as dialogs from "../components/dialogs.js";

// Compatibility boundary for the unchanged V0.4.3 inline event handlers.
export function registerLegacyHandlers() {
  Object.assign(
    window,
    { state },
    navigation,
    home,
    solo,
    multiplayer,
    options,
    shop,
    infos,
    credits,
    dialogs,
  );
}
