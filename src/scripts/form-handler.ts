/* ==========================================================================
   在线留言表单处理（form-handler.ts）— design-spec §6.4
   客户端校验（必填/邮箱）+ 提交（PUBLIC_API_URL 配置后走真实 POST，
   未配置时为前端演示态：校验通过即展示成功面板）
   渐进增强：无 JS 时原生表单提交（page-structure §3.2）
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

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const errors = validate();
    for (const field of errors) {
      setFieldError(field, field.requiredMsg, true);
    }
    if (errors.length > 0) {
      errors[0]?.input.focus();
      return;
    }

    const endpoint = import.meta.env.PUBLIC_API_URL;
    if (!endpoint) {
      // 演示态：后端端点未接入（PUBLIC_API_URL 预留），校验通过即展示成功面板
      if (successPanel) {
        form.hidden = true;
        successPanel.hidden = false;
      }
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (successPanel) {
        form.hidden = true;
        successPanel.hidden = false;
      }
    } catch {
      if (errorBar) {
        errorBar.hidden = false;
      }
    }
  });
}
