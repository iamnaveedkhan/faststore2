// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const model2Schema = new mongoose.Schema({
//   modelId: {
//     type: String,
//     default: function () {
//       return Math.random().toString(36).substring(7);
//     },
//     unique: true
//   },
//   product: {
//     productName: { type: String, default: null },
//     productLink: { type: String, default: "" },
//     thumbnail: { type: String, default: null },
//   },
//   variants: {
//     main: { type: Boolean, default: false },
//     date: { type: Date, default: Date.now },
//     price: { type: Number, default: 1 },
//     quantity: { type: Number, default: 1 },
//     variant: [mongoose.Schema.Types.Mixed],
//   },
//   filters: {
//     type: { type: String, default: null },
//     filter: mongoose.Schema.Types.Mixed,
//   },
//   photoId: { type: String, ref: "Photo" },
//   propertiesId: { type: String, ref: "Properties" },
//   specificationId: { type: String, ref: "Specification" },
//   colorCode: { type: String, default: "" },
//   isActive: { type: Boolean, default: true },
// });

// const Model2 = mongoose.model("Model2", model2Schema);
// module.exports = Model2;
