import mongoose from "mongoose";

const siteDataSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        unique: true,
    },
    items: [
        {
            image: String,
            title: String,
            description: String,
            link: String,
            category: String,
        }
    ],
}, { timestamps: true });

const SiteData = mongoose.model("SiteData", siteDataSchema);

export default SiteData;
