import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Mission from '#models/mission'
import Table from '#models/table'

export default class extends BaseSeeder {
  async run() {
    await Mission.createMany([
      {
        title: "Le baiser volé : Photographier les mariés s'embrassant discrètement.",
        isGlobal: true,
        tableId: null,
      },
      {
        title: 'Larmes de joie : Capturer une émotion forte pendant les discours.',
        isGlobal: true,
        tableId: null,
      },
      {
        title: "Le détail qui tue : Une photo d'un élément de décoration que personne n'a remarqué.",
        isGlobal: true,
        tableId: null,
      },
      {
        title: "L'entrée des mariés : Une photo floue ou artistique de leur arrivée dans la salle.",
        isGlobal: true,
        tableId: null,
      },
      {
        title: 'Le roi de la piste : Photographier la personne la plus déchaînée sur le dancefloor.',
        isGlobal: true,
        tableId: null,
      },
    ])

    const missionsByTable: Record<string, string[]> = {
      'Table des mariés': [
        'Selfie de table : Tout le monde sur la photo, sans exception !',
        'Le doyen et le benjamin : Faire poser ensemble la personne la plus âgée et la plus jeune de la table.',
        "Santé ! : Une photo de tous les verres de la table qui s'entrechoquent.",
        'Portrait croisé : Prendre en photo son voisin de gauche en train de rire.',
        'Photobomb : Réussir un photobomb sur une photo de groupe (gentiment !).',
        "Air Guitar : Capturer quelqu'un en plein solo de guitare imaginaire.",
        'La grimace parfaite : Une photo de groupe où tout le monde fait sa pire tête.',
        'Sous la table : Une photo originale prise depuis le sol.',
      ],
      'Cascade de Langevin': [
        'Effet cascade : Une photo en plein mouvement, capturée au vol.',
        'Le rire en chaîne : Capturer une réaction en chaîne de fous rires à la table.',
        'Trinque collective : Tous les verres levés en même temps, chin chin !',
        'Duo improbable : Deux invités de la table qui se connaissaient à peine avant ce soir.',
        "Zoom sur l'essentiel : Un gros plan sur un élément star de la table.",
      ],
      'Cap Méchant': [
        "Pose solennelle : Toute la table alignée comme sur une photo de famille d'autrefois.",
        "L'acteur du soir : Quelqu'un en plein show, bras en l'air.",
        'Vue plongeante : Une photo prise de haut, toute la tablée dans le cadre.',
        'Le complice : Toi avec ton binôme préféré de la soirée.',
        'Toast surprise : Photographier un toast improvisé en plein milieu du dîner.',
      ],
      Maido: [
        'Panorama de table : La plus belle photo large possible de la tablée.',
        "Yeux fermés collectifs : Une photo où personne n'a les yeux ouverts (défi !).",
        'Moment figé : Un instant spontané qui raconte toute la soirée.',
        'Jumeaux du soir : Deux invités habillés dans des couleurs qui se répondent.',
        "L'accessoire détourné : Un accessoire de table utilisé de façon inattendue.",
      ],
      'Piton de la Fournaise': [
        'En éruption : Le plus gros éclat de rire de la soirée.',
        "Lave en fusion : Quelqu'un qui danse à fond, en mouvement.",
        'Pyrotechnique : Une photo avec des bougies, des lumières ou des étincelles.',
        'Le sommet : La photo prise la plus haut (bras tendu vers le ciel).',
        "Coulée artistique : Une photo volontairement floue, style œuvre d'art.",
      ],
      'Anse des Cascades': [
        'Regard complice : Deux personnes qui se regardent avec complicité.',
        'Pause détente : Un invité en mode zen total.',
        "L'accessoire star : Zoom sur un nœud pap, une boucle d'oreille, une chaussure.",
        'Trio magazine : Trois invités posés comme sur une couverture de mag.',
        'La ronde : Des mains ou des pieds formant un cercle.',
      ],
      "L'Hermitage": [
        "Carte postale : Une photo digne d'une carte postale de mariage.",
        'Toast en portrait : Un portrait capturé pile pendant un discours.',
        'Ras du sol : Une photo prise au ras de la table ou du sol.',
        'Micro-détail : Un gros plan sur un détail de tenue ou de déco.',
        'Miroir miroir : Une photo prise dans un reflet (fenêtre, cuillère, verre).',
      ],
    }

    for (const [tableName, titles] of Object.entries(missionsByTable)) {
      const table = await Table.findByOrFail('name', tableName)
      await Mission.createMany(
        titles.map((title) => ({
          title,
          isGlobal: false,
          tableId: table.id,
        }))
      )
    }
  }
}
