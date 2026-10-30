
import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Legal() {
	const { pathname } = useLocation();
	const isPrivacy = pathname === "/privacy-policy";

	return (
		<div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
			<Header />

			<main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:py-12">
				<div className="mb-8">
					<Link
						to="/"
						className="text-sm text-blue-400 hover:text-blue-300"
					>
						← Back to home
					</Link>

					<h1 className="mt-6 text-3xl sm:text-4xl font-bold">
						{isPrivacy ? "Privacy Policy" : "Terms of Service"}
					</h1>

					<p className="mt-3 text-sm text-slate-400">
						ft_chess · Last updated: October 30, 2026
					</p>

					<div className="flex flex-wrap gap-3 mt-6">
						<Link
							to="/privacy-policy"
							className={`rounded-lg px-4 py-2 ${
								isPrivacy
									? "bg-blue-600 text-white"
									: "bg-slate-800 text-slate-300 hover:bg-slate-700"
							}`}
						>
							Privacy Policy
						</Link>

						<Link
							to="/terms-of-service"
							className={`rounded-lg px-4 py-2 ${
								!isPrivacy
									? "bg-blue-600 text-white"
									: "bg-slate-800 text-slate-300 hover:bg-slate-700"
							}`}
						>
							Terms of Service
						</Link>
					</div>
				</div>

				{isPrivacy ? (
					<div className="space-y-6 sm:space-y-8">
						<section>
							<h2 className="text-xl font-semibold mb-3">
								1. Introduction
							</h2>
							<p className="text-slate-300 leading-7">
								This Privacy Policy explains how ft_chess
								handles personal information when you use our
								online chess application. The application allows
								users to create accounts, manage profiles,
								connect with other players and play chess online.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								2. Information We Collect
							</h2>
							<p className="text-slate-300 leading-7 mb-3">
								Depending on the features you use, the
								application may process the following information:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-slate-300 leading-7">
								<li>
									<strong>Account information:</strong> username,
									email address and authentication information.
								</li>
								<li>
									<strong>Profile information:</strong> avatar,
									username and account creation or update dates.
								</li>
								<li>
									<strong>Social information:</strong> friend
									connections and sent, received or accepted
									friend requests.
								</li>
								<li>
									<strong>Game information:</strong> active chess game data,
									including player participation, moves and game state.
									Game history and results are not stored permanently.
								</li>
								<li>
									<strong>Technical information:</strong> limited
									technical data may be processed to operate,
									secure and troubleshoot the application.
								</li>
								<li>
									<strong>Chat information:</strong> messages exchanged between
									friends are transmitted in real time and are not stored
									permanently by the application.
								</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								3. Why We Use This Information
							</h2>
							<p className="text-slate-300 leading-7">
								Information is used to create and manage accounts,
								authenticate users, display profiles, support
								friend features, operate chess games, maintain
								application security and troubleshoot technical
								problems. Information should only be used for
								purposes that are compatible with these functions
								and any applicable legal requirements.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								4. Passwords and Account Security
							</h2>
							<p className="text-slate-300 leading-7">
								Passwords are hashed using Argon2 before being stored and are
								never stored in plain text. Authentication is handled using
								JSON Web Tokens (JWT). Users should keep their credentials
								confidential.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								5. Sharing and Disclosure
							</h2>
							<p className="text-slate-300 leading-7">
								Profile information may be visible to other users
								where required by the application's features.
								Friend relationships and game-related information
								may also be available to the players concerned.
								Personal information should not be sold. Access
								may be necessary for authorized project
								maintainers to operate, secure or troubleshoot
								the application, or where disclosure is required
								by law.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								6. Data Retention
							</h2>
							<p className="text-slate-300 leading-7">
								Account, profile and friendship information is stored in the
								application database. Active chess games and chat messages
								are not stored permanently and are lost when their in-memory
								state is cleared. Authentication information kept in browser
								local storage is removed when the user logs out.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								7. Your Privacy Rights
							</h2>
							<p className="text-slate-300 leading-7">
								Depending on applicable law, including the GDPR
								where it applies, you may have the right to request
								access to, correction of or deletion of your
								personal data, to restrict or object to certain
								processing, and to receive portable data in
								applicable circumstances. You may also have the
								right to lodge a complaint with a data protection
								supervisory authority. Requests can be directed
								to the project team responsible for the application.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								8. Cookies and Local Storage
							</h2>
							<p className="text-slate-300 leading-7">
								The application uses browser local storage to keep the
								authentication token and basic session information such as
								the authenticated user identifier and username. The
								application does not use analytics or advertising cookies.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								9. Changes to This Policy
							</h2>
							<p className="text-slate-300 leading-7">
								This policy may be updated when the application,
								its data practices or applicable requirements
								change. The latest version will be published on
								this page with an updated revision date.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								10. Contact
							</h2>
							<p className="text-slate-300 leading-7">
								For questions about this policy or requests
								concerning personal information, contact the
								ft_chess project maintainers through the
								project's official communication channel.
							</p>
						</section>
					</div>
				) : (
					<div className="space-y-6 sm:space-y-8">
						<section>
							<h2 className="text-xl font-semibold mb-3">
								1. Acceptance of These Terms
							</h2>
							<p className="text-slate-300 leading-7">
								By creating an account or using ft_chess,
								you agree to these Terms of Service. If you do
								not agree, you should stop using the application.
								These terms apply to all users of the service.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								2. About the Service
							</h2>
							<p className="text-slate-300 leading-7">
								ft_chess is an online chess application
								that provides account and profile management,
								player connections and online chess gameplay.
								Features may change as the project is developed
								and maintained.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								3. Accounts and Responsibilities
							</h2>
							<ul className="list-disc pl-6 space-y-2 text-slate-300 leading-7">
								<li>
									Provide accurate information when creating
									or updating your account.
								</li>
								<li>
									Keep your login credentials confidential and
									do not impersonate another person.
								</li>
								<li>
									You are responsible for activity carried out
									through your account, subject to applicable law.
								</li>
								<li>
									Do not attempt to access another user's
									account or private information without
									authorization.
								</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								4. Acceptable Use
							</h2>
							<p className="text-slate-300 leading-7 mb-3">
								You agree not to:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-slate-300 leading-7">
								<li>
									Use the application for unlawful, fraudulent
									or abusive purposes.
								</li>
								<li>
									Harass, threaten, impersonate or deliberately
									disrupt other players.
								</li>
								<li>
									Exploit bugs, manipulate game requests or
									attempt to gain an unfair advantage by
									interfering with the service.
								</li>
								<li>
									Probe, attack, overload or bypass the
									application's security measures.
								</li>
								<li>
									Upload avatars or other content that is
									unlawful, abusive or infringes another
									person's rights.
								</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								5. Chess Games and Player Interactions
							</h2>
							<p className="text-slate-300 leading-7">
								Players are expected to interact respectfully
								and use the game and friend features appropriately.
								Game availability, matchmaking, results and
								connection continuity may be affected by technical
								problems. Users must not attempt to disrupt other
								players' games or exploit application defects.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								6. User Content
							</h2>
							<p className="text-slate-300 leading-7">
								You remain responsible for content you submit,
								including your username and avatar, and must
								have the rights necessary to use it. You grant
								the application permission to store and display
								that content as needed to provide its features.
								You must not submit content that violates the
								law or the rights of others.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								7. Availability and Changes
							</h2>
							<p className="text-slate-300 leading-7">
								The service may be updated, interrupted or
								temporarily unavailable for maintenance,
								development or technical reasons. Features may
								be modified or discontinued where reasonably
								necessary. We will not claim that the service
								is uninterrupted or error-free.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								8. Suspension and Termination
							</h2>
							<p className="text-slate-300 leading-7">
								Access may be restricted when reasonably necessary
								to protect the service, its users or its security,
								or to address serious violations of these terms,
								subject to applicable law. Users may stop using
								the service at any time. Account and data deletion
								requests are handled according to the application's
								available procedures and applicable legal requirements.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								9. Disclaimer and Liability
							</h2>
							<p className="text-slate-300 leading-7">
								The application is provided on an as-available
								basis. To the extent permitted by applicable law,
								the project team does not guarantee uninterrupted
								operation or that every defect will be corrected.
								Nothing in these terms excludes or limits
								liability where such exclusion or limitation
								would be unlawful.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								10. Changes to These Terms
							</h2>
							<p className="text-slate-300 leading-7">
								These terms may be updated when the application
								or its requirements change. The latest version
								will be published on this page with an updated
								revision date. Continued use after changes take
								effect is subject to applicable law and any
								required notice or acceptance.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-3">
								11. Contact
							</h2>
							<p className="text-slate-300 leading-7">
								For questions about these terms, contact the
								ft_chess project maintainers through the
								project's official communication channel.
							</p>
						</section>
					</div>
				)}

				<div className="mt-12 border-t border-slate-800 pt-6 text-sm text-slate-400">
					Please also read our{" "}
					<Link
						to={isPrivacy ? "/terms-of-service" : "/privacy-policy"}
						className="text-blue-400 hover:underline"
					>
						{isPrivacy ? "Terms of Service" : "Privacy Policy"}
					</Link>.
				</div>
			</main>

			<Footer />
		</div>
	);
}

export default Legal;
