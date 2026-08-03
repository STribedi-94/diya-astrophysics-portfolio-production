/**
 * AMP Gallery Image Records
 *
 * Contains authoritative engineering records for physical Gallery images.
 *
 * Scientific and presentation metadata—including titles, captions, alt text,
 * categories, events and related routes—continues to belong to
 * src/data/gallery.ts.
 */

import { createAssetRecord } from "../contracts/asset-record.mjs";

const GALLERY_IMAGE_DEFINITIONS = [
    {
        recordId: "dot-observing-team",
        fileName: "research_facility_aries_devasthal_dot_36m_observing_team_03.jpg"
    },
    {
        recordId: "dot-visit",
        fileName: "research_facility_aries_devasthal_dot_36m_visit_02.jpg"
    },
    {
        recordId: "dfot-visit",
        fileName: "research_facility_aries_devasthal_dfot_13m_visit_01.jpg"
    },
    {
        recordId: "asi-2022-poster",
        fileName: "conference_asi_2022_poster_presentation_m_dwarf_spectroscopy_01.jpg"
    },
    {
        recordId: "asi-2022-group",
        fileName: "conference_asi_2022_group_photo_02.jpg"
    },
    {
        recordId: "bosefest-2023-oral-01",
        fileName: "conference_bose_fest_2023_oral_presentation_01.jpg"
    },
    {
        recordId: "bosefest-2023-oral-02",
        fileName: "conference_bose_fest_2023_oral_presentation_02.jpg"
    },
    {
        recordId: "bosefest-2023-oral-03",
        fileName: "conference_bose_fest_2023_oral_presentation_03.jpg"
    },
    {
        recordId: "bosefest-2023-facilities-01",
        fileName: "conference_bose_fest_2023_observational_facilities_presentation_01.jpg"
    },
    {
        recordId: "bosefest-2023-facilities-02",
        fileName: "conference_bose_fest_2023_observational_facilities_presentation_02.jpg"
    },
    {
        recordId: "bosefest-2024-poster-adleo",
        fileName: "conference_bose_fest_2024_poster_presentation_ad_leonis_01.jpg"
    },
    {
        recordId: "bosefest-2025-flare",
        fileName: "conference_bose_fest_2025_oral_presentation_flare_energy_analysis_01.jpg.jpg"
    },
    {
        recordId: "bosefest-2025-starspots",
        fileName: "conference_bose_fest_2025_oral_presentation_starspots_02.jpg.jpg"
    },
    {
        recordId: "nsss-2024-poster",
        fileName: "conference_nsss_2024_poster_presentation_ad_leonis_01.jpg"
    },
    {
        recordId: "nsss-2024-participation",
        fileName: "conference_nsss_2024_symposium_participation_02.jpg"
    },
    {
        recordId: "starformation-2024-team",
        fileName: "conference_star_formation_2024_research_team_group_photo_02.jpg"
    },
    {
        recordId: "starformation-2024-supervisor",
        fileName: "conference_star_formation_2024_supervisor_and_collaborators_01.jpg"
    },
    {
        recordId: "bina",
        fileName: "conference_bina_group_photo_01.jpg"
    },
    {
        recordId: "phd-thesis-5000",
        fileName: "academic_phd_5000_word_thesis_submission_presentation_01.jpg"
    },
    {
        recordId: "phd-thesis-hardcopy",
        fileName: "academic_phd_final_hard_copy_thesis_submission_university_of_calcutta_02.jpg"
    },
    {
        recordId: "msc-moon",
        fileName: "academic_msc_astrophysics_moon_observation_14inch_telescope_01.jpg"
    },
    {
        recordId: "msc-sports",
        fileName: "academic_msc_astrophysics_annual_sports_day_group_photo_02.jpg"
    },
    {
        recordId: "msc-xavotsav",
        fileName: "academic_msc_astrophysics_xavotsav_group_photo_03.jpg"
    },
    {
        recordId: "bsc-study",
        fileName: "academic_bsc_physics_honours_batchmates_study_session_01.jpg"
    },
    {
        recordId: "bsc-light-lab",
        fileName: "academic_bsc_physics_honours_light_practical_lab_02.jpg"
    },
    {
        recordId: "teachers-day-cake",
        fileName: "campus_teachers_day_celebration_cake_cutting_02.jpg.jpg"
    },
    {
        recordId: "teachers-day-faculty",
        fileName: "campus_teachers_day_celebration_faculty_and_researchers_01.jpg"
    },
    {
        recordId: "teachers-day-group",
        fileName: "campus_teachers_day_celebration_group_photo_03.jpg"
    },
    {
        recordId: "teachers-day-outdoor",
        fileName: "campus_teachers_day_celebration_outdoor_group_photo_04.jpg"
    }
];

function createGalleryImageRecord({ recordId, fileName }) {
    return Object.assign(
        createAssetRecord(),
        {
            id: `image-gallery-${recordId}`,
            type: "image",
            category: "gallery",
            status: "active",

            source: {
                key: `images/gallery/${fileName}`,
                fileName,
                mimeType: "image/jpeg"
            },

            derivatives: {},

            website: {
                recordId
            },

            metadata: {},

            processing: {
                processor: "image",
                profile: "gallery-original"
            },

            cloud: {},

            relationships: {
                consumers: ["gallery"]
            }
        }
    );
}

export const galleryImageRecords =
    GALLERY_IMAGE_DEFINITIONS.map(createGalleryImageRecord);

export const galleryImageRecordCount =
    galleryImageRecords.length;