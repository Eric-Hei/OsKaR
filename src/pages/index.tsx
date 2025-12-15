import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  Target,
  Brain,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const HomePage: React.FC = () => {
  const router = useRouter();

  const features = [
    {
      icon: Target,
      title: 'Canvas guidé',
      description: 'Transformez vos ambitions en objectifs mesurables grâce à notre processus en 5 étapes.',
    },
    {
      icon: Brain,
      title: 'IA Coach intégrée',
      description: 'Bénéficiez de conseils personnalisés et de validations intelligentes en temps réel.',
    },
    {
      icon: BarChart3,
      title: 'Suivi en temps réel',
      description: 'Visualisez vos progrès avec des tableaux de bord interactifs et des métriques claires.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Partagez vos objectifs avec votre équipe et alignez tous vos efforts.',
    },
  ];

  const benefits = [
    'Clarté et focus sur vos priorités',
    'Transformation des idées en actions concrètes',
    'Accompagnement IA personnalisé',
    'Suivi régulier et motivation continue',
    'Rapports automatiques pour vos partenaires',
    'Méthode éprouvée sans complexité',
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'CEO, TechStart',
      content: 'OsKaR m\'a aidée à structurer ma vision et à la transformer en résultats concrets. En 6 mois, nous avons doublé notre chiffre d\'affaires !',
      rating: 5,
    },
    {
      name: 'Pierre Martin',
      role: 'Fondateur, GreenTech',
      content: 'L\'IA coach est incroyable ! Elle m\'a guidé pour reformuler mes objectifs et les rendre vraiment SMART. Je recommande vivement.',
      rating: 5,
    },
    {
      name: 'Sophie Laurent',
      role: 'Directrice, InnoLab',
      content: 'Enfin un outil simple et efficace ! Fini les méthodes complexes, OsKaR rend la gestion d\'objectifs accessible à tous.',
      rating: 5,
    },
  ];

  return (
    <Layout
      title="Accueil"
      description="Transformez vos ambitions en résultats avec OsKaR - L'outil de gestion d'objectifs avec IA coach intégrée"
    >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transformez vos{' '}
              <span className="text-yellow-300">ambitions</span>
              <br />
              en résultats concrets
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              L'outil de gestion d'objectifs avec IA coach intégrée,
              spécialement conçu pour les entrepreneurs et dirigeants de PME.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => router.push('/auth/register')}
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="text-primary-700 hover:text-primary-800"
              >
                Commencer gratuitement
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir OsKaR ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une approche simple et guidée pour transformer vos idées en objectifs mesurables,
              avec l'accompagnement d'une IA coach personnalisée.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Les bénéfices pour votre entreprise
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                OsKaR vous aide à créer une culture du résultat sans complexité inutile.
                Gagnez en clarté, en focus et en motivation grâce à notre approche guidée.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <Zap className="h-8 w-8 text-yellow-500 mr-3" />
                  <h3 className="text-xl font-semibold">Résultats rapides</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Clarté des objectifs</span>
                    <span className="font-semibold text-green-600">+85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Motivation équipe</span>
                    <span className="font-semibold text-green-600">+72%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Atteinte des objectifs</span>
                    <span className="font-semibold text-green-600">+68%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez des centaines d'entrepreneurs qui ont transformé leur approche des objectifs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Shield className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à transformer vos ambitions en résultats ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Commencez dès maintenant avec notre canvas guidé et découvrez
              la puissance de l'accompagnement IA personnalisé.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push('/auth/register')}
              rightIcon={<ArrowRight className="h-5 w-5" />}
              className="text-primary-700 hover:text-primary-800"
            >
              Démarrer mon canvas gratuitement
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
