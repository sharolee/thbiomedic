/* ==========================================================================
   在线留言表单处理（form-handler.ts）— design-spec §6.4 + ADR-005
   客户端校验（必填/邮箱）通过后，按 ADR-005 以 mailto: 结构化邮件唤起
   用户邮件客户端发往指定邮箱（收件邮箱由 ContactForm 的 data-email-target
   注入，内容单点维护于 src/content/{zh,en}/data/contact.json）。
   渐进增强：无 JS 时表单 action 降级为 mailto: 直发 + noscript 备用链接。
   由 ContactForm.astro 挂载（岛屿 client:load）
   ========================================================================== */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldError {
  input: HTMLInputElement;
  errorEl: HTMLElement;
  /** 默认必填提示文案（错误元素 span 内文本） */
  requiredMsg: string;
  /** 邮箱格式错误提示（data-error-email，可选） */
  emailMsg: string;
}

export function initContactForm(): void {
  const root = document.querySelector<HTMLElement>('[data-contact-form]');
  const form = document.querySelector<HTMLFormElement>('[data-contact-form-el]');
  if (!root || !form) {
    return;
  }

  const successPanel = root.querySelector<HTMLElement>('[data-form-success]');
  const errorBar = root.querySelector<HTMLElement>('[data-form-error-bar]');
  const targetEmail = root.dataset.emailTarget ?? '';

  const fields: FieldError[] = [];
  for (const input of form.querySelectorAll<HTMLInputElement>('input[data-required]')) {
    const errorEl = root.querySelector<HTMLElement>(`[data-error-for="${input.id}"]`);
    if (errorEl) {
      fields.push({
        input,
        errorEl,
        requiredMsg: errorEl.textContent?.trim() ?? '',
        emailMsg: errorEl.dataset.errorEmail ?? '',
      });
    }
  }

  const setFieldError = (field: FieldError, message: string, show: boolean) => {
    const text = field.errorEl.querySelector('span');
    if (text && message) {
      text.textContent = message;
    }
    field.errorEl.hidden = !show;
    field.input.setAttribute('aria-invalid', String(show));
    field.input.classList.toggle('is-invalid', show);
  };

  const validate = (): FieldError[] => {
    const errors: FieldError[] = [];
    for (const field of fields) {
      const value = field.input.value.trim();
      const isEmailInvalid = field.emailMsg !== '' && value !== '' && !EMAIL_RE.test(value);
      if (!value || isEmailInvalid) {
        const message = isEmailInvalid ? field.emailMsg : field.requiredMsg;
        errors.push({ ...field, requiredMsg: message });
      } else {
        setFieldError(field, field.requiredMsg, false);
      }
    }
    return errors;
  };

  /** ADR-005：拼装 mailto: 结构化邮件（主题 + 正文）并唤起邮件客户端 */
  const buildMailto = (): string => {
    const subject = root.dataset.mailtoSubject ?? '';
    const label = (key: string): string => root.dataset[key] ?? '';
    const value = (name: string): string =>
      (form.elements.namedItem(name) as HTMLInputElement | null)?.value.trim() ?? '';

    const source = value('source');
    const lines = [
      `${label('labelSalutation')}: ${value('salutation')}`.trim(),
      `${label('labelCompany')}: ${value('company')}`.trim(),
      `${label('labelEmail')}: ${value('email')}`.trim(),
      `${label('labelFirstName')}: ${value('first_name')}`.trim(),
      `${label('labelLastName')}: ${value('last_name')}`.trim(),
      `${label('labelPhone')}: ${value('phone')}`.trim(),
      `${label('labelMessage')}\n${value('message')}`.trim(),
    ];
    if (source) {
      lines.push(`${label('labelSource')}: ${source}`.trim());
    }
    const body = lines.filter(Boolean).join('\n\n');
    return `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const errors = validate();
    for (const field of errors) {
      setFieldError(field, field.requiredMsg, true);
    }
    if (errors.length > 0) {
      errors[0]?.input.focus();
      return;
    }

    if (!targetEmail) {
      if (errorBar) errorBar.hidden = false;
      return;
    }

    // 唤起邮件客户端（用户邮件客户端随后发送）
    window.location.href = buildMailto();
    form.hidden = true;
    if (successPanel) successPanel.hidden = false;
  });
}
