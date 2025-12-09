import snake from '../assets/profilepic/snake.png';
import mouse from '../assets/profilepic/mouse.png';
import racoon from '../assets/profilepic/racoon.png';
import boar from '../assets/profilepic/boar.png';
import owl from '../assets/profilepic/owl.png';
import fox from '../assets/profilepic/fox.png';

export const AVATAR_MAP = {
    'snake.png': snake,
    'mouse.png': mouse,
    'racoon.png': racoon,
    'boar.png': boar,
    'owl.png': owl,
    'fox.png': fox,
};

export const DEFAULT_AVATAR = snake;

/**
 * Zwraca lokalny import avatara na podstawie nazwy pliku z backendu
 * @param {string} avatarPath - nazwa pliku z backendu np. "snake.png"
 * @returns {string} - lokalny import obrazka
 */
export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return DEFAULT_AVATAR;
    return AVATAR_MAP[avatarPath] || DEFAULT_AVATAR;
};

/**
 * Zwraca nazwę pliku na podstawie importu
 * @param {string} avatarImport - import obrazka
 * @returns {string} - nazwa pliku np. "snake.png"
 */
export const getAvatarFilename = (avatarImport) => {
    const entries = Object.entries(AVATAR_MAP);
    for (const [filename, path] of entries) {
        if (path === avatarImport) {
            return filename;
        }
    }
    return 'snake.png';
};

export const avatars = [snake, mouse, racoon, boar, owl, fox];