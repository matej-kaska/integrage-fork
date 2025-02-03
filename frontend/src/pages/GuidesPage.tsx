import GuidesHeaderBlob from "components/blobs/GuidesHeaderBlob";
import Footer from "components/footer/Footer";
import Navbar from "components/navbar/Navbar";
import { websiteUrl } from "consts/SEOConsts";
import { Helmet } from "react-helmet-async";

const GuidesPage = () => {
	return (
		<>
			<Helmet>
				<title>Guides - IntegrAGE - Self-Assessment for 55+ Workers+</title>
				<meta name="description" content="Explore our comprehensive guides on using the IntegrAGE self-assessment tool. Tailored for workers aged 55+, learn how to evaluate your tech skills, workplace integration, and well-being." />
				<link rel="canonical" href={`${websiteUrl}/guides`} />
			</Helmet>
			<Navbar />
			<main className="guides-page">
				<GuidesHeaderBlob />
			</main>
			<Footer />
		</>
	);
};

export default GuidesPage;
