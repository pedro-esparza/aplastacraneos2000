// src/ui/PromotionSelector.ts

export type PromotionChoice = 'q' | 'r' | 'b' | 'n';

export class PromotionSelector {
    private modalEl: HTMLDivElement;
    private overlayEl: HTMLDivElement;
    private optionButtons: HTMLButtonElement[];
    private resolveFn?: (choice: PromotionChoice) => void;

    constructor() {
        const modal = document.getElementById('promotion-modal');
        const overlay = document.getElementById('promotion-overlay');
        const optionsContainer = document.getElementById('promotion-options');

        if (!modal || !overlay || !optionsContainer) {
            throw new Error('PromotionSelector: no se encontró la estructura HTML del modal.');
        }

        this.modalEl = modal as HTMLDivElement;
        this.overlayEl = overlay as HTMLDivElement;

        this.optionButtons = Array.from(
            optionsContainer.querySelectorAll<HTMLButtonElement>('button[data-piece]')
        );

        this.optionButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const piece = btn.getAttribute('data-piece') as PromotionChoice;
                if (this.resolveFn) this.resolveFn(piece);
                this.hide();
            });

        });

        this.overlayEl.addEventListener('click', () => {
            this.hide();
            if (this.resolveFn) {
                this.resolveFn('q'); // Por defecto, si cierra, devolvemos 'q'
            }
        });
    }

    public async selectPromotion(): Promise<PromotionChoice> {
        this.show();
        return new Promise<PromotionChoice>((resolve) => {
            this.resolveFn = resolve;
        });
    }

    private show() {
        this.modalEl.classList.remove('hidden');
    }

    private hide() {
        this.modalEl.classList.add('hidden');
        this.resolveFn = undefined;
    }
}
