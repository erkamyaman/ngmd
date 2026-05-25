---
title: Showcase
description: Every NgmdUi component rendered inline from markdown, with realistic context.
---

<ngmd-hero title="Setting up authentication" gradient>
  A guided walkthrough of NgMd's authoring components, framed as the kind of tutorial you'd actually publish.
</ngmd-hero>

# Setting up authentication

This guide walks through wiring an email + password authentication flow into a fresh Angular app, then verifying it end-to-end. It exists primarily to **demo every NgmdUi component inline from markdown**. Restart your dev server if you scaffolded ngmd before 2026-05.

<ngmd-callout type="info" title="Why this page exists">
  Every component below is rendered from a plain <code>.md</code> file, not a hand-coded <code>.page.ts</code>. The catch-all route + Angular Elements wiring lets authoring components compile inside markdown bodies. Read the source at <code>src/content/concepts/showcase.md</code>.
</ngmd-callout>

## Prerequisites <ngmd-badge variant="stable">Stable</ngmd-badge>

You'll need Node 20.19.1 or newer and one of pnpm, npm, yarn, or bun. The flow below uses pnpm but the others work identically.

<ngmd-alert severity="helpful">
  If your team is still on Node 18, upgrade before continuing. AnalogJS 2.5 and Vite 8 both require Node 20.19.1.
</ngmd-alert>

## What you'll build

<ngmd-card-grid columns="3">
  <ngmd-card icon="terminal" title="Login route" cta="Public">
    Form that takes an email and password, posts to your backend, stores the returned JWT.
  </ngmd-card>
  <ngmd-card icon="shield" title="Auth guard" cta="Required">
    Route guard that blocks unauthenticated users from protected pages.
  </ngmd-card>
  <ngmd-card icon="zap" title="Token interceptor" cta="Automatic">
    HTTP interceptor that attaches the JWT to outbound requests.
  </ngmd-card>
</ngmd-card-grid>

## The flow

<ngmd-workflow>
  <ngmd-step title="Install dependencies">
    Add <code>@angular/forms</code> for reactive forms and a JWT helper of your choice. The form layer is the only required piece.
  </ngmd-step>
  <ngmd-step title="Create the login component">
    Standalone component under <code>src/app/pages/login.page.ts</code>. Reactive form with <code>email</code> and <code>password</code> controls, plus a submit handler that calls your auth service.
  </ngmd-step>
  <ngmd-step title="Wire the auth service">
    Service that posts to your API, stores the token in <code>localStorage</code> (or a cookie for SSR projects), and exposes an <code>isAuthenticated</code> signal.
  </ngmd-step>
  <ngmd-step title="Add the route guard">
    Functional guard reading <code>isAuthenticated</code>. Apply it to every route that should require login via the <code>canActivate</code> property.
  </ngmd-step>
  <ngmd-step title="Test the full loop">
    Sign in, navigate to a guarded route, refresh the page, sign out. Each transition should behave correctly.
  </ngmd-step>
</ngmd-workflow>

## Step 1: Install

<ngmd-callout type="tip" title="Pin your forms version">
  Match <code>@angular/forms</code> to your <code>@angular/core</code> version exactly. Mismatched majors will compile but throw at runtime in subtle ways.
</ngmd-callout>

```bash
pnpm add @angular/forms
```

## Step 2: The login component

```ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" type="email" autocomplete="email" />
      <input formControlName="password" type="password" />
      <button type="submit" [disabled]="form.invalid || loading()">
        Sign in
      </button>
    </form>
  `,
})
export default class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    try {
      await this.auth.signIn(this.form.getRawValue());
      this.router.navigate(['/dashboard']);
    } finally {
      this.loading.set(false);
    }
  }
}
```

## Step 3: The auth service

<ngmd-alert severity="warning">
  Storing JWTs in <code>localStorage</code> is the simplest path but exposes them to XSS. For production with stricter requirements, prefer an <code>httpOnly</code> cookie issued by the backend.
</ngmd-alert>

```ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface SignInPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'auth.token';

  readonly token = signal<string | null>(localStorage.getItem(this.tokenKey));
  readonly isAuthenticated = computed(() => this.token() !== null);

  async signIn(payload: SignInPayload): Promise<void> {
    const { token } = await firstValueFrom(
      this.http.post<{ token: string }>('/api/auth/sign-in', payload),
    );
    localStorage.setItem(this.tokenKey, token);
    this.token.set(token);
  }

  signOut(): void {
    localStorage.removeItem(this.tokenKey);
    this.token.set(null);
  }
}
```

## Step 4: The route guard

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.parseUrl('/login');
};
```

## Step 5: Verify

<ngmd-accordion>
  <ngmd-accordion-item title="The happy path" open>
    Submit valid credentials, get redirected to <code>/dashboard</code>, refresh the page, stay logged in. If the refresh logs you out, your token isn't being read on startup.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Invalid credentials">
    Submit bad credentials, see the form's error state, the route does not change. If the route changes anyway your <code>onSubmit</code> isn't awaiting the service call.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Token expiry">
    Wait for the JWT to expire (or set a short <code>exp</code> claim in dev), then make a request. The interceptor should clear the token and redirect to <code>/login</code>. If it doesn't, your interceptor isn't catching 401s.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Sign out">
    Call <code>auth.signOut()</code>, confirm <code>localStorage</code> is empty, navigate to a guarded route, end up on <code>/login</code>. If you stay on the guarded route your guard isn't recomputing.
  </ngmd-accordion-item>
</ngmd-accordion>

## Reference

<ngmd-pill-row>
  <ngmd-pill href="https://angular.dev/guide/forms" title="Reactive forms"></ngmd-pill>
  <ngmd-pill href="https://angular.dev/guide/http" title="HttpClient"></ngmd-pill>
  <ngmd-pill href="https://angular.dev/guide/routing/route-guards" title="Route guards"></ngmd-pill>
  <ngmd-pill href="/concepts/markdown-routes" title="How routing works in NgMd"></ngmd-pill>
</ngmd-pill-row>

## A video to round it off

<ngmd-video src="https://www.youtube.com/watch?v=_ZcHwv91Rmo" title="Angular intro"></ngmd-video>

## And an image, because docs

<ngmd-image
  src="https://angular.dev/assets/images/ng-image.jpg"
  alt="Angular open-graph banner"
  caption="Banner pulled from angular.dev to round out the showcase."
></ngmd-image>

## Inline pieces

Status flags work inline. The forms API is <ngmd-badge variant="stable">Stable</ngmd-badge>, the new `linkedSignal` primitive is <ngmd-badge variant="beta">Beta</ngmd-badge>, and `NgModule`-based bootstrapping is <ngmd-badge variant="deprecated">Deprecated</ngmd-badge>. New helpers ship with a <ngmd-badge variant="new">New</ngmd-badge> tag.

Auto-linked keywords resolve from `ngmd.config.ts`: this guide builds on *Angular and *AnalogJS, with *Tailwind for the form styling and *Shiki for the code blocks you see above.

## Tabs in markdown

Tabs now work inline too, using `&lt;ngmd-tab&gt;` children (real components, not `&lt;ng-template&gt;` directives):

<ngmd-tabs>
  <ngmd-tab title="JWT">
    Stateless tokens signed by the server. Read on every request from <code>Authorization: Bearer</code>. Easy to scale horizontally; revocation needs a denylist.
  </ngmd-tab>
  <ngmd-tab title="Session cookie">
    Server stores the session, client carries an opaque ID. Built-in revocation via session delete. Sticky to one origin.
  </ngmd-tab>
  <ngmd-tab title="OAuth">
    Delegate sign-in to a provider (Google, GitHub, Auth0). You get back a token + identity claims. Best for B2C and "sign in with..." flows.
  </ngmd-tab>
</ngmd-tabs>

For command tabs that pre-render through Shiki at build time, the fenced-code syntax is still the lightest option:

```bash group="install" name="pnpm" image="https://cdn.simpleicons.org/pnpm/F69220" active
pnpm create ngmd@latest my-docs
```

```bash group="install" name="npm" image="https://cdn.simpleicons.org/npm/CB3837"
npm create ngmd@latest my-docs
```

```bash group="install" name="yarn" image="https://cdn.simpleicons.org/yarn/2C8EBB"
yarn create ngmd my-docs
```

```bash group="install" name="bun" image="https://cdn.simpleicons.org/bun/FBF0DF"
bun create ngmd my-docs
```

That's every NgmdUi component working inline in markdown via the catch-all + Custom Elements path. Build pipeline, link guards, sitemap. All of these pages run through the same machinery.
