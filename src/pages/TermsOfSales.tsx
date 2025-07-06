import React from 'react'

const TermsOfSale: React.FC = () => {
  return (
    <section className="terms-condition pb-120 pt-120 mt-lg-0 mt-sm-15 mt-10">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="terms-condition-wrapper p-lg-15 p-md-10 p-sm-8 p-4 bgn-4 rounded">
              <h2 className="tcn-1 mb-10 text-center cursor-scale growUp title-animate">
                Conditions Générales de Vente – Project 42
              </h2>
              <div className="d-grid gap-3 mb-8">
                <h5 className="tcn-1 cursor-scale growDown title-animate">1. Objet</h5>
                <p className="tcn-6 content-anim">
                  Les présentes Conditions Générales de Vente (CGV) régissent les achats de biens numériques (abonnements Premium, crédits, etc.) proposés par Project 42. En effectuant un paiement, vous acceptez les présentes CGV sans réserve.
                </p>
              </div>

              <div className="d-grid gap-3 mb-8">
                <h5 className="tcn-1 cursor-scale growDown title-animate">2. Produits</h5>
                <p className="tcn-6 content-anim">
                  Les produits concernés sont exclusivement numériques et accessibles en ligne immédiatement après validation du paiement. Ils incluent notamment : crédits utilisables en jeu, abonnements Premium et autres avantages liés au compte utilisateur.
                </p>
              </div>

              <div className="d-grid gap-3 mb-8">
                <h5 className="tcn-1 cursor-scale growDown title-animate">3. Paiement</h5>
                <p className="tcn-6 content-anim">
                  Les paiements s’effectuent via des prestataires externes (Stripe ou PayPal). Aucune donnée bancaire n’est stockée sur nos serveurs.
                </p>
              </div>

              <div className="d-grid gap-3 mb-8">
                <h5 className="tcn-1 cursor-scale growDown title-animate">4. Livraison</h5>
                <p className="tcn-6 content-anim">
                  Les produits sont livrés immédiatement après paiement en étant automatiquement appliqués sur le compte du joueur.
                </p>
              </div>

              <div className="d-grid gap-3 mb-8">
                <h5 className="tcn-1 cursor-scale growDown title-animate">5. Absence de droit de rétractation</h5>
                <p className="tcn-6 content-anim">
                  Conformément à l’article L221-28 du Code de la consommation, le droit de rétractation ne s’applique pas aux contenus numériques fournis immédiatement après paiement. En validant votre achat, vous reconnaissez :
                </p>
                <ul className="tcn-6 d-grid gap-2">
                  <li className="content-anim">• Que le contenu sera accessible immédiatement après paiement ;</li>
                  <li className="content-anim">• Que vous consentez expressément à renoncer à votre droit de rétractation.</li>
                </ul>
              </div>

              <div className="d-grid gap-3 mb-8">
                <h5 className="tcn-1 cursor-scale growDown title-animate">6. Remboursements</h5>
                <p className="tcn-6 content-anim">
                  Aucun remboursement ne pourra être effectué après validation du paiement, sauf en cas de dysfonctionnement technique imputable au service. Aucun remboursement ne sera accordé pour des erreurs d'achat ou une mauvaise utilisation des produits achetés.
                </p>
              </div>

              <div className="d-grid gap-3 mb-8">
                <h5 className="tcn-1 cursor-scale growDown title-animate">7. Juridiction</h5>
                <p className="tcn-6 content-anim">
                  Les présentes CGV sont régies par le droit français. En cas de litige, les tribunaux compétents seront ceux du ressort du siège de l'Éditeur du jeu.
                </p>
              </div>

              <div className="d-grid gap-3 mb-8">
                <h5 className="tcn-1 cursor-scale growDown title-animate">8. Contact</h5>
                <p className="tcn-6 content-anim">
                  Pour toute question ou réclamation, vous pouvez contacter l’équipe via le formulaire de contact ou à l’adresse suivante : support@project42.com
                </p>
              </div>

              <div className="d-grid gap-3" style={{ marginTop: '5vh' }}>
                <b className="tcn-6 content-anim title-animate">
                  Dernière mise à jour : le 06/07/2025 à 15:45
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TermsOfSale
