import { useTranslation } from "react-i18next";
import { lazy, Suspense } from "react";
import Loading from "components/loading/Loading";

const LazyGuidesBlobSVG = lazy(() => import('images/img-03.svg?react'));

const GuidesHeaderBlob = () => {
	const { t } = useTranslation();

	return (
		<>
			<section className="guides-header-blob">
				<div className="wrapper">
					<div className="left-side">
						<div className="text-wrapper">
							<h1>{t("GUIDES.TITLE")}</h1>
							<p>{t("GUIDES.DESCRIPTION")}</p>
						</div>
					</div>
					<div className="right-side">
						<Suspense fallback={<Loading />}>
							<LazyGuidesBlobSVG/>
						</Suspense>
					</div>
				</div>
			</section>
		</>
	);
};

export default GuidesHeaderBlob;
