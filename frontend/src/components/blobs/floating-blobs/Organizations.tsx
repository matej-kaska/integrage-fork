import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Organizations = () => {
	const { t } = useTranslation();

	return (
		<>
			<section className="organizations">
				<h2>{t("HOMEPAGE.ABOUT.ORGANIZATIONS.TITLE")}</h2>
				<div className="logos-wrapper">
					<Link to="https://www.bsc-kranj.si/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/BSC-logo.webp" alt="BSC logo" />
					</Link>
					<Link to="https://www.ipcenter.at/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/IPC-logo.webp" alt="IPC logo" />
					</Link>
					<Link to="https://www.facebook.com/Klaster.Socijalnog.Preduzetnistva.Vojvodine/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/CASPEV-logo.webp" alt="CASPEV logo" />
					</Link>
					<Link to="https://slap.hr/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/SLAP-logo.webp" alt="SLAP logo" />
					</Link>
					<Link to="https://schirrmachergroup.de/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/SCHRMR-logo.png" alt="SCHRMR logo" />
					</Link>
					<Link to="https://hics.hu/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/HICS-logo.webp" alt="HICS logo" />
					</Link>
					<Link to="https://www.bcci.bg/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/BCCI-logo.webp" alt="BCCI logo" />
					</Link>
					<Link to="https://inkubator.hr/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/BIOS-logo.webp" alt="BIOS logo" />
					</Link>
					<Link to="https://www.rausk.ba/en/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/RAUSK-logo.webp" alt="RAUSK logo" />
					</Link>
					<Link to="https://www.pannonnovum.hu/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/PN-logo.webp" alt="PN logo" />
					</Link>
					<Link to="https://www.ujep.cz/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/UJEP-logo.webp" alt="UJEP logo" />
					</Link>
					<Link to="https://www.trexima.sk/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/TREXIMA-logo.webp" alt="TREXIMA logo" />
					</Link>
					<Link to="https://en.pks.rs/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/CCIS-logo.webp" alt="CCIS logo" />
					</Link>
					<Link to="https://www.onezimosvet.si/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/JASA-logo.webp" alt="JASA logo" />
					</Link>
					<Link to="https://icuk.cz/" target="_blank" rel="noopener noreferrer">
						<img className="logo" src="src/images/logos/ICUK-logo.webp" alt="ICUK logo" />
					</Link>
				</div>
			</section>
		</>
	);
};

export default Organizations;
