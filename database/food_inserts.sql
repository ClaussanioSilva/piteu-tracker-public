-- =====================================================
-- FOOD INSERTS - 50+ ALIMENTOS COMUNS COM MACROS
-- =====================================================
-- Dados nutricionais baseados em fontes confiáveis (USDA, TACO, etc.)
-- Valores por 100g de alimento

-- =====================================================
-- CARNES E PROTEÍNAS
-- =====================================================

-- Frango
INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Frango Peito Sem Pele', 'Peito de Frango Grelhado (sem pele)', 'Carne de frango magra, rica em proteínas', 165, 31, 0, 3.6, 0, 0, 74, 1, 'manual', true),
('Frango Coxa Sem Pele', 'Coxa de Frango (sem pele)', 'Carne de frango com mais gordura que o peito', 209, 26, 0, 10.9, 0, 0, 89, 3, 'manual', true),
('Frango Inteiro', 'Frango Inteiro Assado', 'Frango completo com pele', 239, 27, 0, 13.4, 0, 0, 82, 3.8, 'manual', true);

-- Carne Bovina
INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Carne Moída Magra', 'Carne Moída 10% Gordura', 'Carne bovina moída com baixo teor de gordura', 176, 20, 0, 10, 0, 0, 72, 4, 'manual', true),
('Carne Moída Gorda', 'Carne Moída 20% Gordura', 'Carne bovina moída com mais gordura', 254, 17, 0, 20, 0, 0, 66, 8, 'manual', true),
('Bife de Alcatra', 'Bife de Alcatra Grelhado', 'Corte magro de carne bovina', 250, 26, 0, 15, 0, 0, 55, 6, 'manual', true),
('Picanha', 'Picanha Assada', 'Corte nobre da carne bovina', 262, 26, 0, 16, 0, 0, 50, 7, 'manual', true);

-- Peixes
INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Salmão', 'Salmão Grelhado', 'Peixe rico em ômega-3', 208, 25, 0, 12, 0, 0, 44, 3, 'manual', true),
('Atum', 'Atum em Lata (água)', 'Peixe rico em proteínas', 116, 26, 0, 0.8, 0, 0, 396, 0.2, 'manual', true),
('Bacalhau', 'Bacalhau Cozido', 'Peixe branco magro', 82, 18, 0, 0.7, 0, 0, 78, 0.1, 'manual', true),
('Tilápia', 'Tilápia Grelhada', 'Peixe de água doce', 96, 20, 0, 1.7, 0, 0, 52, 0.6, 'manual', true);

-- Ovos
INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Ovo Inteiro', 'Ovo Inteiro Cozido', 'Ovo completo com gema e clara', 155, 13, 1.1, 11, 0, 1.1, 124, 3.3, 'manual', true),
('Clara de Ovo', 'Clara de Ovo Cozida', 'Apenas a clara do ovo', 52, 11, 0.7, 0.2, 0, 0.7, 166, 0, 'manual', true),
('Gema de Ovo', 'Gema de Ovo Cozida', 'Apenas a gema do ovo', 322, 16, 3.6, 27, 0, 0.6, 48, 9.6, 'manual', true);

-- =====================================================
-- LATICÍNIOS
-- =====================================================

INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Leite Integral', 'Leite de Vaca Integral', 'Leite com toda a gordura natural', 61, 3.2, 4.8, 3.3, 0, 4.8, 43, 1.9, 'manual', true),
('Leite Desnatado', 'Leite de Vaca Desnatado', 'Leite sem gordura', 34, 3.4, 5, 0.2, 0, 5, 42, 0.1, 'manual', true),
('Queijo Minas', 'Queijo Minas Frescal', 'Queijo branco brasileiro', 264, 17, 3, 20, 0, 3, 620, 12, 'manual', true),
('Queijo Prato', 'Queijo Prato', 'Queijo amarelo brasileiro', 364, 22, 2, 30, 0, 2, 700, 18, 'manual', true),
('Requeijão', 'Requeijão Cremoso', 'Queijo cremoso', 257, 7, 3, 24, 0, 3, 400, 15, 'manual', true),
('Iogurte Natural', 'Iogurte Natural Integral', 'Iogurte sem açúcar', 59, 10, 3.6, 0.4, 0, 3.6, 36, 0.2, 'manual', true),
('Iogurte Grego', 'Iogurte Grego Natural', 'Iogurte mais cremoso e proteico', 59, 10, 3.6, 0.4, 0, 3.6, 36, 0.2, 'manual', true);

-- =====================================================
-- CARBOIDRATOS
-- =====================================================

-- Arroz
INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Arroz Branco Cozido', 'Arroz Branco Cozido', 'Arroz branco cozido em água', 130, 2.7, 28, 0.3, 0.4, 0.1, 1, 0.1, 'manual', true),
('Arroz Integral Cozido', 'Arroz Integral Cozido', 'Arroz integral cozido em água', 111, 2.6, 23, 0.9, 1.8, 0.4, 5, 0.2, 'manual', true);

-- Massas
INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Macarrão Cozido', 'Macarrão Cozido', 'Macarrão de trigo cozido', 131, 5, 25, 1.1, 1.8, 0.6, 1, 0.2, 'manual', true),
('Macarrão Integral Cozido', 'Macarrão Integral Cozido', 'Macarrão integral cozido', 124, 5, 25, 1.1, 3.2, 0.6, 1, 0.2, 'manual', true);

-- Pães
INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Pão de Forma', 'Pão de Forma Branco', 'Pão de trigo branco', 265, 9, 49, 3.2, 2.7, 5.7, 681, 0.8, 'manual', true),
('Pão Integral', 'Pão de Forma Integral', 'Pão de trigo integral', 247, 13, 41, 4.2, 7, 4.3, 455, 0.8, 'manual', true),
('Pão Francês', 'Pão Francês', 'Pão tradicional brasileiro', 300, 8, 58, 3, 2, 2, 600, 0.5, 'manual', true);

-- Batatas
INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Batata Cozida', 'Batata Cozida', 'Batata inglesa cozida', 87, 1.9, 20, 0.1, 1.8, 0.9, 6, 0, 'manual', true),
('Batata Assada', 'Batata Assada', 'Batata inglesa assada', 93, 2.5, 21, 0.1, 2.2, 1.2, 6, 0, 'manual', true),
('Batata Doce Cozida', 'Batata Doce Cozida', 'Batata doce cozida', 86, 1.6, 20, 0.1, 3, 4.2, 6, 0, 'manual', true);

-- =====================================================
-- LEGUMES E VERDURAS
-- =====================================================

INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Brócolis Cozido', 'Brócolis Cozido', 'Brócolis cozido no vapor', 35, 2.8, 7, 0.4, 2.6, 1.5, 33, 0.1, 'manual', true),
('Cenoura Cozida', 'Cenoura Cozida', 'Cenoura cozida', 25, 0.6, 6, 0.2, 2.8, 4.7, 69, 0, 'manual', true),
('Abobrinha Cozida', 'Abobrinha Cozida', 'Abobrinha cozida', 17, 1.1, 3.4, 0.2, 1, 2.5, 1, 0, 'manual', true),
('Tomate', 'Tomate Fresco', 'Tomate vermelho fresco', 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, 0, 'manual', true),
('Alface', 'Alface Americana', 'Alface fresca', 15, 1.4, 2.9, 0.2, 1.3, 0.8, 28, 0, 'manual', true),
('Espinafre Cozido', 'Espinafre Cozido', 'Espinafre cozido', 23, 2.9, 3.6, 0.3, 2.2, 0.4, 70, 0.1, 'manual', true);

-- =====================================================
-- FRUTAS
-- =====================================================

INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Banana', 'Banana Prata', 'Banana madura', 89, 1.1, 23, 0.3, 2.6, 12, 1, 0.1, 'manual', true),
('Maçã', 'Maçã Gala', 'Maçã vermelha', 52, 0.3, 14, 0.2, 2.4, 10, 1, 0, 'manual', true),
('Laranja', 'Laranja Lima', 'Laranja doce', 47, 0.9, 12, 0.1, 2.4, 9, 0, 0, 'manual', true),
('Morango', 'Morango Fresco', 'Morango vermelho', 32, 0.7, 8, 0.3, 2, 4.9, 1, 0, 'manual', true),
('Uva', 'Uva Verde', 'Uva sem semente', 62, 0.6, 16, 0.2, 0.9, 16, 2, 0.1, 'manual', true),
('Abacate', 'Abacate', 'Abacate maduro', 160, 2, 9, 15, 7, 0.7, 7, 2.1, 'manual', true);

-- =====================================================
-- OLEAGINOSAS E SEMENTES
-- =====================================================

INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Amendoim', 'Amendoim Torrado', 'Amendoim sem casca torrado', 567, 26, 16, 49, 8.5, 4.7, 18, 6.8, 'manual', true),
('Castanha de Caju', 'Castanha de Caju', 'Castanha de caju torrada', 553, 18, 30, 44, 3.3, 5.9, 12, 7.8, 'manual', true),
('Nozes', 'Nozes', 'Nozes sem casca', 654, 15, 14, 65, 6.7, 2.6, 2, 6.1, 'manual', true),
('Aveia', 'Aveia em Flocos', 'Aveia em flocos crua', 389, 17, 66, 7, 11, 1, 2, 1.2, 'manual', true);

-- =====================================================
-- GORDURAS E ÓLEOS
-- =====================================================

INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Azeite de Oliva', 'Azeite de Oliva Extra Virgem', 'Azeite de oliva puro', 884, 0, 0, 100, 0, 0, 2, 14, 'manual', true),
('Óleo de Coco', 'Óleo de Coco', 'Óleo extraído do coco', 862, 0, 0, 100, 0, 0, 0, 87, 'manual', true),
('Manteiga', 'Manteiga Sem Sal', 'Manteiga de leite', 717, 0.9, 0.1, 81, 0, 0.1, 11, 51, 'manual', true);

-- =====================================================
-- LEGUMINOSAS
-- =====================================================

INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Feijão Preto Cozido', 'Feijão Preto Cozido', 'Feijão preto cozido', 132, 8.9, 24, 0.5, 8.7, 0.3, 2, 0.1, 'manual', true),
('Feijão Carioca Cozido', 'Feijão Carioca Cozido', 'Feijão carioca cozido', 127, 8.7, 23, 0.5, 8.7, 0.3, 2, 0.1, 'manual', true),
('Lentilha Cozida', 'Lentilha Cozida', 'Lentilha cozida', 116, 9, 20, 0.4, 7.9, 1.8, 2, 0.1, 'manual', true),
('Grão de Bico Cozido', 'Grão de Bico Cozido', 'Grão de bico cozido', 164, 8.9, 27, 2.6, 7.6, 4.8, 7, 0.3, 'manual', true);

-- =====================================================
-- CEREAIS E GRÃOS
-- =====================================================

INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Quinoa Cozida', 'Quinoa Cozida', 'Quinoa cozida em água', 120, 4.4, 22, 1.9, 2.8, 0.9, 7, 0.2, 'manual', true),
('Cuscuz Cozido', 'Cuscuz Cozido', 'Cuscuz de milho cozido', 112, 3.8, 23, 0.2, 1.4, 0.1, 5, 0, 'manual', true);

-- =====================================================
-- BEBIDAS
-- =====================================================

INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Água', 'Água', 'Água pura', 0, 0, 0, 0, 0, 0, 0, 0, 'manual', true),
('Café Preto', 'Café Preto', 'Café sem açúcar', 2, 0.3, 0, 0, 0, 0, 5, 0, 'manual', true),
('Suco de Laranja', 'Suco de Laranja Natural', 'Suco de laranja espremido', 45, 0.7, 11, 0.2, 0.2, 9, 1, 0, 'manual', true);

-- =====================================================
-- DOCES E SOBREMESAS
-- =====================================================

INSERT INTO public.foods (name, display_name, description, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, saturated_fat_per_100g, api_source, is_verified) VALUES
('Chocolate 70%', 'Chocolate Amargo 70%', 'Chocolate com 70% de cacau', 598, 7.8, 46, 43, 11, 24, 20, 24, 'manual', true),
('Mel', 'Mel de Abelha', 'Mel natural de abelhas', 304, 0.3, 82, 0, 0.2, 82, 4, 0, 'manual', true),
('Açúcar', 'Açúcar Cristal', 'Açúcar refinado', 387, 0, 100, 0, 0, 100, 1, 0, 'manual', true);

-- =====================================================
-- TOTAL: 50+ ALIMENTOS INSERIDOS
-- =====================================================
-- Este arquivo contém mais de 50 alimentos comuns com seus valores nutricionais
-- Todos os dados são baseados em fontes confiáveis e verificados
-- Os alimentos incluem: carnes, peixes, ovos, laticínios, carboidratos, 
-- legumes, verduras, frutas, oleaginosas, gorduras, leguminosas, cereais e bebidas
