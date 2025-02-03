import * as ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import "../i18n";
import App from "./App";
import { store } from "./redux/store";
import { HelmetProvider } from "react-helmet-async";

const rootElement = document.getElementById("root");

if (rootElement) {
	ReactDOM.createRoot(rootElement).render(
		<Provider store={store}>
			<HelmetProvider>
				<App />
			</HelmetProvider>
		</Provider>
	);
} else {
	console.error("Failed to find the root element");
}
