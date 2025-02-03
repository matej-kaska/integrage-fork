import AboutBlob from "components/blobs/AboutBlob";
import FillSurveyBlob from "components/blobs/FillSurveyBlob";
import HeaderBlob from "components/blobs/HeaderBlob";
import Organizations from "components/blobs/floating-blobs/Organizations";
import Footer from "components/footer/Footer";
import Navbar from "components/navbar/Navbar";
import { websiteUrl } from "consts/SEOConsts";
import { Helmet } from "react-helmet-async";
import LogoEU from "images/IntegrAGE-EU.svg?react";
import { Link } from "react-router-dom";

const Homepage = () => {
	return (
		<>
			<Helmet>
				<title>IntegrAGE - Self-Assessment Tool for Workers aged 55+</title>
				<meta name="description" content="IntegrAGE - Discover your strengths with self-assessment tool for workers aged 55+. Evaluate your skills in technology, workplace integration and well-being." />
				<link rel="canonical" href={`${websiteUrl}/`} />
			</Helmet>
			<Navbar />
			<main className="homepage">
				<div className="logo-eu-wrapper">
					<div className="csv-filler"/>
					<Link to="https://www.interregeurope.eu/" target="_blank" rel="noopener noreferrer" aria-label="Visit Interreg Europe website">
						<LogoEU className="logo-eu"/>
					</Link>
					<div className="filler"/>
				</div>
				<HeaderBlob />
				<AboutBlob />
				<FillSurveyBlob />
				<Organizations />
			</main>
			<Footer />
		</>
	);
};

export default Homepage;