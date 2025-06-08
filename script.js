const data = [
  {
    step: 'Phase commerciale et appels d\'offres',
    who: 'Équipe commerciale',
    action: 'Répondre aux devis et appels d\'offres, rédiger le mémoire technique, chiffrer le projet',
    documents: 'Devis, CCAP, CCTP, mémoire technique'
  },
  {
    step: 'Gestion de projet',
    who: 'Conducteur de travaux',
    action: 'Prendre en main l\'affaire, relire les documents, établir le planning et les documents de suivi',
    documents: 'CCAP, CCTP, mémoire technique, plans de sécurité'
  },
  {
    step: 'Bureau d\'étude',
    who: 'Bureau d\'étude',
    action: 'Réaliser les calculs et le dimensionnement, produire les plans pour validation, fabrication et pose, constituer le DOE',
    documents: 'CCTP, plans, notes de calcul, fiches techniques, certificats'
  },
  {
    step: 'Production en atelier',
    who: 'Atelier',
    action: 'Fabriquer et assembler les ouvrages selon les plans',
    documents: 'Dossier de plans'
  },
  {
    step: 'Chantier et pose',
    who: 'Équipe chantier',
    action: 'Organiser le transport, poser les ouvrages, gérer le matériel',
    documents: 'Planning, rapports de chantier'
  },
  {
    step: 'Achats et approvisionnement',
    who: 'Service achats',
    action: 'Consulter les fournisseurs, passer les commandes, relancer pour les délais',
    documents: 'Demandes d\'offre, bons de commande, confirmations'
  },
  {
    step: 'Comptabilité et paiements',
    who: 'Comptable',
    action: 'Assurer la comptabilité, gérer les paiements et les relances clients',
    documents: 'Factures, relevés'
  }
];

function initTimeline() {
  const container = document.getElementById('timeline');
  data.forEach(item => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';

    const title = document.createElement('h2');
    title.textContent = item.step;
    stepDiv.appendChild(title);

    const content = document.createElement('div');
    content.className = 'content';
    content.innerHTML = `
      <p><strong>Qui :</strong> ${item.who}</p>
      <p><strong>Action :</strong> ${item.action}</p>
      <p><strong>Documents :</strong> ${item.documents}</p>
    `;
    stepDiv.appendChild(content);

    stepDiv.addEventListener('click', () => {
      stepDiv.classList.toggle('active');
    });

    container.appendChild(stepDiv);
  });
}

document.addEventListener('DOMContentLoaded', initTimeline);
