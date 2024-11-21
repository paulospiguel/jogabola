import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

i18n
	.use(initReactI18next)
	.use(
		resourcesToBackend((language, namespace, callback) => {
			import(`/public/locales/${language}/${namespace}.json`)
				.then((resources) => callback(null, resources))
				.catch((error) => callback(error, null));
		}),
	)
	.init({
		fallbackLng: "pt",
		supportedLngs: ["en", "pt", "es"],
		ns: ["common"],
		defaultNS: "common",
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
