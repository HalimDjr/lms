import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fadeIn } from "../components/common/motionFrameVarients";
import Footer from "../components/common/Footer";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const Contact = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Le nom est requis";
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }
    if (!formData.subject.trim()) errors.subject = "Le sujet est requis";
    if (!formData.message.trim()) errors.message = "Le message est requis";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);

      // Simuler un appel API
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      }, 1500);
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div
      className={`min-h-screen pt-16 ${
        darkMode ? "bg-richblack-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Hero Section */}
      <section
        className={`relative ${
          darkMode
            ? "bg-gradient-to-b from-blue-900 to-richblack-900"
            : "bg-gradient-to-b from-blue-600 to-blue-800"
        } py-20`}
      >
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={fadeIn("up", 0.1)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.1 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Nous sommes là pour répondre à toutes vos questions concernant nos
              formations et services portuaires.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <motion.div
              variants={fadeIn("right", 0.1)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="lg:col-span-1"
            >
              <div
                className={`rounded-xl p-8 ${
                  darkMode ? "bg-richblack-800" : "bg-white"
                } shadow-lg`}
              >
                <h2 className="text-2xl font-bold mb-6">
                  Informations de contact
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        darkMode ? "bg-blue-900/50" : "bg-blue-100"
                      }`}
                    >
                      <FaMapMarkerAlt
                        className={`text-xl ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Adresse</h3>
                      <p
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        13, avenue des frères Amrani, Béjaia 06000 Algérie
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        darkMode ? "bg-blue-900/50" : "bg-blue-100"
                      }`}
                    >
                      <FaPhoneAlt
                        className={`text-xl ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Téléphone</h3>
                      <p
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        +213 (0) 034 16 76 31
                        <br />
                        +213 (0) 034 16 75 73
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        darkMode ? "bg-blue-900/50" : "bg-blue-100"
                      }`}
                    >
                      <FaEnvelope
                        className={`text-xl ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Email</h3>
                      <p
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        portbj@portdebejaia.dz
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        darkMode ? "bg-blue-900/50" : "bg-blue-100"
                      }`}
                    >
                      <FaClock
                        className={`text-xl ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        Heures d'ouverture
                      </h3>
                      <p
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        Lundi - Jeudi: 8h00 - 16h30
                        <br />
                        Vendredi: 8h00 - 12h00
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-richblack-700">
                  <h3 className="font-semibold text-lg mb-4">Suivez-nous</h3>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.youtube.com/@portdebejaiaepb9358"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${
                        darkMode
                          ? "bg-richblack-700 hover:bg-red-500"
                          : "bg-gray-200 hover:bg-red-500"
                      } p-3 rounded-full transition-colors duration-300`}
                    >
                      <FaYoutube
                        className={`text-xl ${
                          darkMode
                            ? "text-white"
                            : "text-gray-700 hover:text-white"
                        }`}
                      />
                    </a>

                    <a
                      href="https://www.linkedin.com/company/port-de-b%C3%A9jaia/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${
                        darkMode
                          ? "bg-richblack-700 hover:bg-blue-700"
                          : "bg-gray-200 hover:bg-blue-700"
                      } p-3 rounded-full transition-colors duration-300`}
                    >
                      <FaLinkedinIn
                        className={`text-xl ${
                          darkMode
                            ? "text-white"
                            : "text-gray-700 hover:text-white"
                        }`}
                      />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              variants={fadeIn("left", 0.1)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="lg:col-span-2"
            >
              <div
                className={`rounded-xl p-8 ${
                  darkMode ? "bg-richblack-800" : "bg-white"
                } shadow-lg`}
              >
                <h2 className="text-2xl font-bold mb-6">
                  Envoyez-nous un message
                </h2>

                {submitSuccess && (
                  <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Votre message a été envoyé avec succès. Nous vous répondrons
                    dans les plus brefs délais.
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="name"
                        className={`block mb-2 font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg outline-none transition-colors ${
                          darkMode
                            ? "bg-richblack-700 text-white border border-richblack-600 focus:border-blue-500"
                            : "bg-gray-50 text-gray-900 border border-gray-200 focus:border-blue-500"
                        } ${formErrors.name ? "border-red-500" : ""}`}
                        placeholder="Votre nom"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-red-500 text-sm">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className={`block mb-2 font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg outline-none transition-colors ${
                          darkMode
                            ? "bg-richblack-700 text-white border border-richblack-600 focus:border-blue-500"
                            : "bg-gray-50 text-gray-900 border border-gray-200 focus:border-blue-500"
                        } ${formErrors.email ? "border-red-500" : ""}`}
                        placeholder="votre@email.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-red-500 text-sm">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className={`block mb-2 font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg outline-none transition-colors ${
                          darkMode
                            ? "bg-richblack-700 text-white border border-richblack-600 focus:border-blue-500"
                            : "bg-gray-50 text-gray-900 border border-gray-200 focus:border-blue-500"
                        }`}
                        placeholder="Votre numéro de téléphone"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className={`block mb-2 font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Sujet <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg outline-none transition-colors ${
                          darkMode
                            ? "bg-richblack-700 text-white border border-richblack-600 focus:border-blue-500"
                            : "bg-gray-50 text-gray-900 border border-gray-200 focus:border-blue-500"
                        } ${formErrors.subject ? "border-red-500" : ""}`}
                        placeholder="Sujet de votre message"
                      />
                      {formErrors.subject && (
                        <p className="mt-1 text-red-500 text-sm">
                          {formErrors.subject}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className={`block mb-2 font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className={`w-full px-4 py-3 rounded-lg outline-none transition-colors ${
                        darkMode
                          ? "bg-richblack-700 text-white border border-richblack-600 focus:border-blue-500"
                          : "bg-gray-50 text-gray-900 border border-gray-200 focus:border-blue-500"
                      } ${formErrors.message ? "border-red-500" : ""}`}
                      placeholder="Votre message"
                    ></textarea>
                    {formErrors.message && (
                      <p className="mt-1 text-red-500 text-sm">
                        {formErrors.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-3 rounded-lg text-white font-medium transition-all ${
                        darkMode
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      } flex items-center justify-center`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer le message"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeIn("up", 0.1)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.1 }}
            className="rounded-xl overflow-hidden shadow-lg"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.2039421308147!2d5.0833!3d36.7500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ1JzAwLjAiTiA1wrAwNScwMC4wIkU!5e0!3m2!1sfr!2sdz!4v1635000000000!5m2!1sfr!2sdz"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="EPB Location"
              className="w-full"
            ></iframe>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
