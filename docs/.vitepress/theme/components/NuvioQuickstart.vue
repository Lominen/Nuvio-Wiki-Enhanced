<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { useData, withBase } from 'vitepress'

const { lang } = useData()

const props = withDefaults(defineProps<{
  defaultExpanded?: boolean
  hideTip?: boolean
  hideHeader?: boolean
}>(), {
  defaultExpanded: false,
  hideTip: false,
  hideHeader: false
})

// --- Translations ---
const translations = {
  en: {
    title: 'Account details',
    nuvioAccount: 'Nuvio account',
    newAccountsAuto: 'New accounts are created automatically',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    emailReqError: 'Enter your email address.',
    emailInvalidError: 'Enter a valid email address, such as name@example.com.',
    passwordLabel: 'Nuvio password',
    passwordPlaceholder: 'At least 6 characters',
    passwordMinError: 'Your Nuvio password must be at least 6 characters.',
    torboxTitle: 'TorBox',
    torboxDesc: 'Connect your account with an API key',
    needTorbox: 'Need TorBox?',
    torboxRefDesc: 'Open a subscription with my referral applied',
    getTorbox: 'Get TorBox',
    torboxKeyLabel: 'TorBox API key',
    torboxKeyPlaceholder: 'Paste your TorBox API key',
    torboxHelp: 'Find it in',
    torboxHelpLink: 'TorBox settings',
    torboxReqError: 'Enter your TorBox API key.',
    aiostreamsPwdLabel: 'AIOStreams config password',
    aiostreamsPwdHelp: 'Keep this if you want to edit AIOStreams later.',
    aiostreamsPwdMinError: 'The AIOStreams config password must be at least 6 characters.',
    regenerate: 'Regenerate',
    modeLabel: 'Setup mode',
    simpleMode: 'Simple',
    simpleModeDesc: 'Recommended defaults',
    advancedMode: 'Advanced',
    advancedModeDesc: 'Catalog and matching options',
    advanced: 'Advanced options',
    advancedSub: 'Only change what you need',
    catalogLabel: 'Catalog addon',
    catalogHelp: 'Nuvio Catalog is the default in both setup modes.',
    catalogNuvio: 'Nuvio Catalog (recommended)',
    catalogCinemeta: 'Cinemeta',
    catalogNone: 'No catalog addon',
    catalogCustom: 'Custom manifest URL',
    customCatalogLabel: 'Catalog manifest URL',
    customCatalogPlaceholder: 'https://example.com/manifest.json',
    customCatalogError: 'Enter a valid HTTPS catalog or manifest URL.',
    advancedDesc: "Tam's metadata matching is enabled when a TMDB key is supplied. Without it, only those metadata-dependent filters are disabled.",
    tmdbLabel: 'TMDB API key',
    tvdbLabel: 'TVDB API key',
    optional: 'Optional',
    submitBtn: 'Set up my Nuvio account',
    privacyNote: 'Credentials are sent only to Nuvio, TorBox, and Midnight\'s AIOStreams instance for this setup request.',
    buildingTitle: 'Building your setup',
    validating: 'Validate details',
    checkTorbox: 'Check TorBox',
    connectNuvio: 'Connect Nuvio',
    buildAiostreams: 'Build AIOStreams',
    installAddons: 'Install addons',
    complete: 'Complete',
    readyTitle: 'Your Nuvio setup is ready',
    installs: 'Installs',
    addonAio: 'AIOStreams',
    addonCatalog: 'Nuvio Catalog',
    manifestLabel: 'AIOStreams manifest',
    copy: 'Copy',
    copied: 'Copied',
    openAioSettings: 'Open AIOStreams settings',
    startOver: 'Start over',
    retryBtn: 'Try again',
    checkFieldBtn: 'Check field',
    setupStopped: 'Setup stopped',
    keysSecureNote: 'Keys are never stored',
    yourCredentials: 'Your credentials',
    credentialsNote: 'Save these now — they won\'t be shown again.',
    nuvioEmail: 'Nuvio email',
    nuvioPasswordLabel: 'Nuvio password',
    aiostreamsPasswordLabel: 'AIOStreams settings password',
    newAccountBadge: 'New account',
    showNuvioPassword: 'Show Nuvio password',
    hideNuvioPassword: 'Hide Nuvio password',
    showTorboxApiKey: 'Show TorBox API key',
    hideTorboxApiKey: 'Hide TorBox API key'
  },
  nl: {
    title: 'Accountgegevens',
    nuvioAccount: 'Nuvio-account',
    newAccountsAuto: 'Nieuwe accounts worden automatisch aangemaakt',
    emailLabel: 'E-mailadres',
    emailPlaceholder: 'je@voorbeeld.com',
    emailReqError: 'Voer je e-mailadres in.',
    emailInvalidError: 'Voer een geldig e-mailadres in, zoals naam@voorbeeld.com.',
    passwordLabel: 'Nuvio-wachtwoord',
    passwordPlaceholder: 'Minimaal 6 tekens',
    passwordMinError: 'Je Nuvio-wachtwoord moet minimaal 6 tekens lang zijn.',
    torboxTitle: 'TorBox',
    torboxDesc: 'Verbind je account met een API-sleutel',
    needTorbox: 'TorBox nodig?',
    torboxRefDesc: 'Open een abonnement met mijn referral toegepast',
    getTorbox: 'TorBox verkrijgen',
    torboxKeyLabel: 'TorBox API-sleutel',
    torboxKeyPlaceholder: 'Plak je TorBox API-sleutel',
    torboxHelp: 'Vind deze in',
    torboxHelpLink: 'TorBox-instellingen',
    torboxReqError: 'Voer je TorBox API-sleutel in.',
    aiostreamsPwdLabel: 'AIOStreams-configuratie wachtwoord',
    aiostreamsPwdHelp: 'Bewaar dit als je AIOStreams later wilt bewerken.',
    aiostreamsPwdMinError: 'Het AIOStreams-configuratiewachtwoord moet minimaal 6 tekens lang zijn.',
    regenerate: 'Genereer nieuwe',
    modeLabel: 'Installatiemodus',
    simpleMode: 'Eenvoudig',
    simpleModeDesc: 'Aanbevolen standaardinstellingen',
    advancedMode: 'Geavanceerd',
    advancedModeDesc: 'Catalogus- en koppelopties',
    advanced: 'Geavanceerde opties',
    advancedSub: 'Wijzig alleen wat je nodig hebt',
    catalogLabel: 'Catalogus-addon',
    catalogHelp: 'Nuvio Catalog is de standaard in beide installatiemodi.',
    catalogNuvio: 'Nuvio Catalog (aanbevolen)',
    catalogCinemeta: 'Cinemeta',
    catalogNone: 'Geen catalogus-addon',
    catalogCustom: 'Aangepaste manifest-URL',
    customCatalogLabel: 'Catalogus-manifest-URL',
    customCatalogPlaceholder: 'https://voorbeeld.nl/manifest.json',
    customCatalogError: 'Voer een geldige HTTPS-catalogus- of manifest-URL in.',
    advancedDesc: "Tam's metadata-koppeling wordt ingeschakeld wanneer een TMDB-sleutel wordt opgegeven. Zonder deze sleutel worden alleen de filters die afhankelijk zijn van metadata uitgeschakeld.",
    tmdbLabel: 'TMDB API-sleutel',
    tvdbLabel: 'TVDB API-sleutel',
    optional: 'Optioneel',
    submitBtn: 'Mijn Nuvio-account instellen',
    privacyNote: 'Inloggegevens worden voor dit installatieverzoek alleen verzonden naar Nuvio, TorBox en de AIOStreams-instantie van Midnight.',
    buildingTitle: 'Bezig met het bouwen van je setup',
    validating: 'Gegevens valideren',
    checkTorbox: 'TorBox controleren',
    connectNuvio: 'Nuvio verbinden',
    buildAiostreams: 'AIOStreams bouwen',
    installAddons: 'Addons installeren',
    complete: 'Voltooid',
    readyTitle: 'Je Nuvio-setup is gereed',
    installs: 'Installeert',
    addonAio: 'AIOStreams',
    addonCatalog: 'Nuvio Catalog',
    manifestLabel: 'AIOStreams manifest',
    copy: 'Kopiëren',
    copied: 'Gekopieerd',
    openAioSettings: 'Open AIOStreams-instellingen',
    startOver: 'Opnieuw beginnen',
    retryBtn: 'Opnieuw proberen',
    checkFieldBtn: 'Controleer veld',
    setupStopped: 'Setup gestopt',
    keysSecureNote: 'Sleutels worden nooit opgeslagen',
    yourCredentials: 'Jouw inloggegevens',
    credentialsNote: 'Sla deze nu op — ze worden niet opnieuw getoond.',
    nuvioEmail: 'Nuvio e-mail',
    nuvioPasswordLabel: 'Nuvio-wachtwoord',
    aiostreamsPasswordLabel: 'AIOStreams-instellingen wachtwoord',
    newAccountBadge: 'Nieuw account',
    showNuvioPassword: 'Nuvio-wachtwoord tonen',
    hideNuvioPassword: 'Nuvio-wachtwoord verbergen',
    showTorboxApiKey: 'TorBox API-sleutel tonen',
    hideTorboxApiKey: 'TorBox API-sleutel verbergen'
  }
}

const t = computed(() => {
  const currentLang = (lang.value || '').startsWith('nl') ? 'nl' : 'en'
  return translations[currentLang]
})

// --- State Management ---
type ViewMode = 'form' | 'progress' | 'result'
type SetupMode = 'simple' | 'advanced'
type CatalogMode = 'nuvio' | 'cinemeta' | 'none' | 'custom'
const currentView = ref<ViewMode>('form')
const isCollapsed = ref(!props.defaultExpanded)
const setupMode = ref<SetupMode>('simple')

const form = reactive({
  email: '',
  nuvioPassword: '',
  torboxApiKey: '',
  aiostreamsPassword: '',
  tmdbApiKey: '',
  tvdbApiKey: '',
  catalogMode: 'nuvio' as CatalogMode,
  customCatalogUrl: ''
})

const errors = reactive({
  email: '',
  nuvioPassword: '',
  torboxApiKey: '',
  aiostreamsPassword: '',
  customCatalogUrl: ''
})

const showNuvioPassword = ref(false)
const showTorboxApiKey = ref(false)

const progressMessage = ref('Starting...')
const activeStep = ref('details')
const completedSteps = ref<string[]>([])
const stepsOrder = ['details', 'torbox', 'nuvio', 'aiostreams', 'addons']

interface SetupResult {
  email: string
  nuvioAccountCreated: boolean
  nuvioPassword?: string
  aiostreamsPassword: string
  installedProfiles: number
  aiostreamsManifest: string
  aiostreamsConfigureUrl: string
  aiostreamsName: string
  tamTemplateVersion: string
  metadataMatchingEnabled: boolean
  torboxPlan: number
  addons: string[]
}

const result = ref<SetupResult | null>(null)
const globalError = ref<string | null>(null)
const errorStep = ref<string>('setup')
const lastErrorField = ref<string | null>(null)
const isSubmitting = ref(false)
const copySuccess = ref(false)

// --- Helper Functions ---
function randomPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  return Array.from(bytes).map((val) => alphabet[val % alphabet.length]).join('')
}

function generatePassword() {
  form.aiostreamsPassword = randomPassword()
  errors.aiostreamsPassword = ''
}

function setSetupMode(mode: SetupMode) {
  setupMode.value = mode
  errors.customCatalogUrl = ''
}

// Initialize password
generatePassword()

function validateForm(): boolean {
  let isValid = true
  errors.email = ''
  errors.nuvioPassword = ''
  errors.torboxApiKey = ''
  errors.aiostreamsPassword = ''
  errors.customCatalogUrl = ''

  if (!form.email.trim()) {
    errors.email = t.value.emailReqError
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t.value.emailInvalidError
    isValid = false
  }

  if (form.nuvioPassword.length < 6) {
    errors.nuvioPassword = t.value.passwordMinError
    isValid = false
  }

  if (!form.torboxApiKey.trim()) {
    errors.torboxApiKey = t.value.torboxReqError
    isValid = false
  }

  if (form.aiostreamsPassword.length < 6) {
    errors.aiostreamsPassword = t.value.aiostreamsPwdMinError
    isValid = false
  }

  if (setupMode.value === 'advanced' && form.catalogMode === 'custom') {
    try {
      const url = new URL(form.customCatalogUrl)
      if (url.protocol !== 'https:') throw new Error()
    } catch {
      errors.customCatalogUrl = t.value.customCatalogError
      isValid = false
    }
  }

  return isValid
}

async function handleCopy() {
  if (!result.value) return
  await navigator.clipboard.writeText(result.value.aiostreamsManifest)
  copySuccess.value = true
  setTimeout(() => {
    copySuccess.value = false
  }, 1500)
}

function startOver() {
  form.email = ''
  form.nuvioPassword = ''
  form.torboxApiKey = ''
  form.tmdbApiKey = ''
  form.tvdbApiKey = ''
  form.catalogMode = 'nuvio'
  form.customCatalogUrl = ''
  setupMode.value = 'simple'
  generatePassword()
  globalError.value = null
  lastErrorField.value = null
  completedSteps.value = []
  activeStep.value = 'details'
  currentView.value = 'form'
}

function handleRetry() {
  globalError.value = null
  currentView.value = 'form'
  if (lastErrorField.value && lastErrorField.value in form) {
    const el = document.getElementById(lastErrorField.value)
    el?.focus()
  }
}

// --- Setup Submission (SSE stream parsing) ---
async function submitSetup() {
  if (!validateForm()) {
    const firstInvalidField = (['email', 'nuvioPassword', 'torboxApiKey', 'aiostreamsPassword', 'customCatalogUrl'] as const)
      .find((field) => errors[field])

    if (firstInvalidField) {
      await nextTick()
      document.getElementById(firstInvalidField)?.focus()
    }

    return
  }

  isSubmitting.value = true
  globalError.value = null
  lastErrorField.value = null
  completedSteps.value = []
  activeStep.value = 'details'
  progressMessage.value = 'Validating details...'
  currentView.value = 'progress'

  try {
    const payload = setupMode.value === 'simple'
      ? {
          ...form,
          tmdbApiKey: '',
          tvdbApiKey: '',
          catalogMode: 'nuvio',
          customCatalogUrl: ''
        }
      : { ...form }

    const response = await fetch(withBase('/api/ai/setup'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => null)
      throw new Error(errBody?.error || `Request failed with status ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response stream available.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue
        const event = JSON.parse(line)

        if (event.type === 'progress') {
          activeStep.value = event.step
          progressMessage.value = event.message
          // Add to completed steps if it's past the step
          const currentIdx = stepsOrder.indexOf(event.step)
          completedSteps.value = stepsOrder.slice(0, currentIdx)
        } else if (event.type === 'error') {
          throw { message: event.message, step: event.step }
        } else if (event.type === 'result') {
          completedSteps.value = [...stepsOrder]
          activeStep.value = 'complete'
          result.value = event.data
          currentView.value = 'result'
          isSubmitting.value = false
          return
        }
      }

      if (done) break
    }
  } catch (err: any) {
    isSubmitting.value = false
    const errMsg = err.message || 'An unexpected error occurred.'
    const step = err.step || 'setup'
    errorStep.value = step

    globalError.value = errMsg

    if (step === 'torbox') {
      errors.torboxApiKey = errMsg
      lastErrorField.value = 'torboxApiKey'
    } else if (step === 'details' && /email/i.test(errMsg)) {
      errors.email = errMsg
      lastErrorField.value = 'email'
    } else if (step === 'details' && /password/i.test(errMsg)) {
      errors.nuvioPassword = errMsg
      lastErrorField.value = 'nuvioPassword'
    } else if (step === 'details' && /(catalog|manifest|url)/i.test(errMsg)) {
      errors.customCatalogUrl = errMsg
      lastErrorField.value = 'customCatalogUrl'
      setupMode.value = 'advanced'
    }

    currentView.value = 'form'
  }
}
</script>

<template>
  <div class="quickstart-shell">
    <div v-if="!hideTip" class="quickstart-tip">
      <strong>Nuvio Quickstart</strong>
      <span v-if="(lang || '').startsWith('nl')">Stel Nuvio, TorBox en AIOStreams in via één begeleide flow.</span>
      <span v-else>Set up Nuvio, TorBox, and AIOStreams in one guided flow.</span>
    </div>

    <section class="quickstart-card" :class="{ 'is-standalone': hideHeader }">
      <button
        v-if="!hideHeader"
        class="quickstart-toggle"
        type="button"
        :aria-expanded="!isCollapsed"
        aria-controls="nuvio-quickstart-body"
        @click="isCollapsed = !isCollapsed"
      >
        <span class="quickstart-toggle__identity">
          <img :src="withBase('/tools_icon_coloured.webp')" alt="" aria-hidden="true" />
          <span><strong>Nuvio Quickstart</strong><small>AIOStreams + TorBox</small></span>
        </span>
        <svg viewBox="0 0 20 20" aria-hidden="true" :class="{ rotated: !isCollapsed }"><path d="m6 8 4 4 4-4" /></svg>
      </button>

      <div id="nuvio-quickstart-body" v-show="!isCollapsed" class="quickstart-body">
        <header class="quickstart-intro">
          <div>
            <span class="eyebrow">Guided setup</span>
            <h2>Everything you need, in one pass.</h2>
            <p>Connect your accounts and we’ll install a ready-to-use streaming setup.</p>
          </div>
          <div class="setup-summary" aria-label="Included in setup">
            <span><i class="summary-dot summary-dot--brand"></i>AIOStreams</span>
            <span><i class="summary-dot"></i>{{ t.addonCatalog }}</span>
            <span class="secure-pill">
              <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="8" width="12" height="9" rx="2" /><path d="M7 8V6a3 3 0 0 1 6 0v2" /></svg>
              {{ t.keysSecureNote }}
            </span>
          </div>
        </header>

        <div v-if="globalError" class="inline-alert" role="alert">
          <span class="inline-alert__mark">!</span>
          <div><strong>{{ t.setupStopped }}</strong><p>{{ globalError }}</p></div>
          <button type="button" @click="handleRetry">{{ lastErrorField ? t.checkFieldBtn : t.retryBtn }}</button>
        </div>

        <form v-if="currentView === 'form'" class="setup-form" novalidate @submit.prevent="submitSetup">
          <div class="mode-picker" role="group" :aria-label="t.modeLabel">
            <button
              type="button"
              :class="{ active: setupMode === 'simple' }"
              :aria-pressed="setupMode === 'simple'"
              @click="setSetupMode('simple')"
            >
              <span>{{ t.simpleMode }}</span>
              <small>{{ t.simpleModeDesc }}</small>
            </button>
            <button
              type="button"
              :class="{ active: setupMode === 'advanced' }"
              :aria-pressed="setupMode === 'advanced'"
              @click="setSetupMode('advanced')"
            >
              <span>{{ t.advancedMode }}</span>
              <small>{{ t.advancedModeDesc }}</small>
            </button>
          </div>

          <section class="setup-panel">
            <div class="panel-heading">
              <div><h3>{{ t.nuvioAccount }}</h3><p>{{ t.newAccountsAuto }}</p></div>
            </div>

            <label class="field" :class="{ 'has-error': errors.email }">
              <span>{{ t.emailLabel }}</span>
              <input id="email" v-model="form.email" type="email" :placeholder="t.emailPlaceholder" autocomplete="email" required :aria-invalid="Boolean(errors.email)" :aria-describedby="errors.email ? 'email-error' : undefined" @input="errors.email = ''" />
              <small v-if="errors.email" id="email-error">{{ errors.email }}</small>
            </label>

            <label class="field" :class="{ 'has-error': errors.nuvioPassword }">
              <span>{{ t.passwordLabel }}</span>
              <span class="input-action">
                <input id="nuvioPassword" v-model="form.nuvioPassword" :type="showNuvioPassword ? 'text' : 'password'" :placeholder="t.passwordPlaceholder" autocomplete="current-password" required :aria-invalid="Boolean(errors.nuvioPassword)" :aria-describedby="errors.nuvioPassword ? 'nuvio-password-error' : undefined" @input="errors.nuvioPassword = ''" />
                <button type="button" :aria-label="showNuvioPassword ? t.hideNuvioPassword : t.showNuvioPassword" :aria-pressed="showNuvioPassword" @click="showNuvioPassword = !showNuvioPassword">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" /><circle cx="10" cy="10" r="2.5" /></svg>
                </button>
              </span>
              <small v-if="errors.nuvioPassword" id="nuvio-password-error">{{ errors.nuvioPassword }}</small>
            </label>
          </section>

          <section class="setup-panel">
            <div class="panel-heading">
              <div><h3>{{ t.torboxTitle }}</h3><p>{{ t.torboxDesc }}</p></div>
            </div>

            <label class="field" :class="{ 'has-error': errors.torboxApiKey }">
              <span class="field-label-row">
                <span>{{ t.torboxKeyLabel }}</span>
                <a href="https://torbox.app/settings" target="_blank" rel="noreferrer">{{ t.torboxHelpLink }} ↗</a>
              </span>
              <span class="input-action">
                <input id="torboxApiKey" v-model="form.torboxApiKey" :type="showTorboxApiKey ? 'text' : 'password'" :placeholder="t.torboxKeyPlaceholder" autocomplete="off" required :aria-invalid="Boolean(errors.torboxApiKey)" :aria-describedby="errors.torboxApiKey ? 'torbox-api-key-error' : undefined" @input="errors.torboxApiKey = ''" />
                <button type="button" :aria-label="showTorboxApiKey ? t.hideTorboxApiKey : t.showTorboxApiKey" :aria-pressed="showTorboxApiKey" @click="showTorboxApiKey = !showTorboxApiKey">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" /><circle cx="10" cy="10" r="2.5" /></svg>
                </button>
              </span>
              <small v-if="errors.torboxApiKey" id="torbox-api-key-error">{{ errors.torboxApiKey }}</small>
            </label>

            <a class="torbox-referral" href="https://torbox.app/subscription?referral=41d1ac85-ee5e-4699-9f0a-92e67cbc2fb2" target="_blank" rel="noreferrer">
              <span><strong>{{ t.needTorbox }}</strong><small>{{ t.torboxRefDesc }}</small></span>
              <span>{{ t.getTorbox }} ↗</span>
            </a>
          </section>

          <section v-if="setupMode === 'advanced'" class="advanced">
            <div class="advanced-heading">
              <div><h3>{{ t.advanced }}</h3><p>{{ t.advancedSub }}</p></div>
              <span>{{ t.optional }}</span>
            </div>
            <div class="advanced-fields">
              <label class="field advanced-catalog">
                <span>{{ t.catalogLabel }}</span>
                <select v-model="form.catalogMode" @change="errors.customCatalogUrl = ''">
                  <option value="nuvio">{{ t.catalogNuvio }}</option>
                  <option value="cinemeta">{{ t.catalogCinemeta }}</option>
                  <option value="none">{{ t.catalogNone }}</option>
                  <option value="custom">{{ t.catalogCustom }}</option>
                </select>
                <em>{{ t.catalogHelp }}</em>
              </label>
              <label v-if="form.catalogMode === 'custom'" class="field advanced-catalog" :class="{ 'has-error': errors.customCatalogUrl }">
                <span>{{ t.customCatalogLabel }}</span>
                <input id="customCatalogUrl" v-model="form.customCatalogUrl" type="url" :placeholder="t.customCatalogPlaceholder" autocomplete="url" :aria-invalid="Boolean(errors.customCatalogUrl)" :aria-describedby="errors.customCatalogUrl ? 'custom-catalog-error' : undefined" @input="errors.customCatalogUrl = ''" />
                <small v-if="errors.customCatalogUrl" id="custom-catalog-error">{{ errors.customCatalogUrl }}</small>
              </label>
              <label class="field advanced-password" :class="{ 'has-error': errors.aiostreamsPassword }">
                <span>{{ t.aiostreamsPwdLabel }}</span>
                <span class="input-action input-action--text">
                  <input id="aiostreamsPassword" v-model="form.aiostreamsPassword" type="text" required :aria-invalid="Boolean(errors.aiostreamsPassword)" :aria-describedby="errors.aiostreamsPassword ? 'aiostreams-password-error' : undefined" @input="errors.aiostreamsPassword = ''" />
                  <button type="button" @click="generatePassword">{{ t.regenerate }}</button>
                </span>
                <small v-if="errors.aiostreamsPassword" id="aiostreams-password-error">{{ errors.aiostreamsPassword }}</small>
                <em v-else>{{ t.aiostreamsPwdHelp }}</em>
              </label>
              <p>{{ t.advancedDesc }}</p>
              <label class="field"><span>{{ t.tmdbLabel }} <i>{{ t.optional }}</i></span><input id="tmdbApiKey" v-model="form.tmdbApiKey" type="password" autocomplete="off" /></label>
              <label class="field"><span>{{ t.tvdbLabel }} <i>{{ t.optional }}</i></span><input id="tvdbApiKey" v-model="form.tvdbApiKey" type="password" autocomplete="off" /></label>
            </div>
          </section>

          <footer class="form-footer">
            <p>{{ t.privacyNote }}</p>
            <button class="primary-action" type="submit" :disabled="isSubmitting">
              {{ t.submitBtn }}
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M12 6l4 4-4 4" /></svg>
            </button>
          </footer>
        </form>

        <div v-else-if="currentView === 'progress'" class="state-view" aria-live="polite">
          <div class="state-heading"><span class="loader"></span><div><span class="eyebrow">In progress</span><h2>{{ t.buildingTitle }}</h2><p>{{ progressMessage }}</p></div></div>
          <ol class="step-track">
            <li v-for="step in [
              { id: 'details', label: t.validating },
              { id: 'torbox', label: t.checkTorbox },
              { id: 'nuvio', label: t.connectNuvio },
              { id: 'aiostreams', label: t.buildAiostreams },
              { id: 'addons', label: t.installAddons }
            ]" :key="step.id" :class="{ active: activeStep === step.id, done: completedSteps.includes(step.id) }">
              <i></i><span>{{ step.label }}</span>
            </li>
          </ol>
        </div>

        <div v-else-if="currentView === 'result' && result" class="state-view result-view" aria-live="polite">
          <div class="success-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg></div>
          <span class="eyebrow">{{ t.complete }}</span>
          <h2>{{ t.readyTitle }}</h2>
          <p>{{ result.email }} was {{ result.nuvioAccountCreated ? 'created' : 'connected' }}. {{ result.addons.join(' and ') }} {{ result.addons.length === 1 ? 'was' : 'were' }} installed on {{ result.installedProfiles }} profile{{ result.installedProfiles === 1 ? '' : 's' }}.</p>

          <div class="result-grid">
            <section>
              <span class="result-label">{{ t.manifestLabel }}</span>
              <div class="copy-row"><input :value="result.aiostreamsManifest" readonly /><button type="button" @click="handleCopy">{{ copySuccess ? t.copied : t.copy }}</button></div>
            </section>
            <section class="credentials">
              <span class="result-label">{{ t.yourCredentials }}</span>
              <p>{{ t.credentialsNote }}</p>
              <dl>
                <template v-if="result.nuvioAccountCreated"><dt>{{ t.nuvioEmail }}</dt><dd>{{ result.email }}</dd><dt>{{ t.nuvioPasswordLabel }}</dt><dd><code>{{ result.nuvioPassword }}</code></dd></template>
                <dt>{{ t.aiostreamsPasswordLabel }}</dt><dd><code>{{ result.aiostreamsPassword }}</code></dd>
              </dl>
            </section>
          </div>

          <div class="result-actions">
            <a :href="result.aiostreamsConfigureUrl" target="_blank" rel="noreferrer">{{ t.openAioSettings }} ↗</a>
            <button type="button" @click="startOver">{{ t.startOver }}</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.quickstart-shell { --qs-radius: 14px; color: var(--vp-c-text-1); }
.quickstart-tip { display: flex; gap: 10px; margin: 0 0 16px; padding: 12px 14px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg-soft); font-size: 13px; }
.quickstart-tip span { color: var(--vp-c-text-2); }
.quickstart-card { overflow: hidden; border: 1px solid var(--vp-c-divider); border-radius: var(--qs-radius); background: var(--vp-c-bg); }
.quickstart-card.is-standalone { border: 0; border-radius: 0; background: transparent; }
.quickstart-toggle { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 15px 18px; border: 0; background: transparent; color: inherit; cursor: pointer; }
.quickstart-toggle__identity { display: flex; align-items: center; gap: 11px; text-align: left; }
.quickstart-toggle__identity img { width: 32px; height: 32px; }
.quickstart-toggle__identity span { display: grid; }
.quickstart-toggle__identity strong { font-size: 14px; }
.quickstart-toggle__identity small { color: var(--vp-c-text-3); }
.quickstart-toggle > svg { width: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; transition: transform .2s ease; }
.rotated { transform: rotate(180deg); }
.quickstart-body { padding: 22px; }
.quickstart-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--vp-c-divider); }
.eyebrow { display: block; margin-bottom: 5px; color: var(--vp-c-brand-1); font: 700 10px/1.2 var(--vp-font-family-mono); letter-spacing: .1em; text-transform: uppercase; }
.quickstart-intro h2, .state-view h2 { margin: 0 !important; border: 0 !important; font-size: 21px !important; line-height: 1.25; }
.quickstart-intro p, .state-view > p { margin: 6px 0 0; max-width: 550px; color: var(--vp-c-text-2); font-size: 13px; line-height: 1.55; }
.setup-summary { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px 14px; min-width: 300px; color: var(--vp-c-text-2); font-size: 11px; }
.setup-summary > span { display: inline-flex; align-items: center; gap: 6px; }
.summary-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--vp-c-text-3); }
.summary-dot--brand { background: var(--vp-c-brand-1); }
.secure-pill { width: 100%; justify-content: flex-end; color: var(--vp-c-text-3); }
.secure-pill svg { width: 13px; fill: none; stroke: currentColor; stroke-width: 1.7; }
.inline-alert { display: flex; align-items: center; gap: 12px; margin-top: 18px; padding: 12px; border: 1px solid var(--vp-c-danger-2); border-radius: 10px; background: color-mix(in srgb, var(--vp-c-danger-1) 7%, transparent); }
.inline-alert__mark { display: grid; place-items: center; width: 25px; height: 25px; border-radius: 50%; background: var(--vp-c-danger-1); color: white; font-weight: 800; }
.inline-alert div { flex: 1; }
.inline-alert strong { font-size: 12px; }
.inline-alert p { margin: 1px 0 0; color: var(--vp-c-danger-1); font-size: 11px; }
.inline-alert button { border: 0; background: transparent; color: var(--vp-c-danger-1); font-weight: 700; cursor: pointer; }
.setup-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding-top: 18px; }
.mode-picker { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; padding: 5px; border: 1px solid var(--vp-c-divider); border-radius: 11px; background: var(--tool-surface-alt, var(--vp-c-bg-alt)); }
.mode-picker button { display: grid; gap: 2px; padding: 9px 12px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--vp-c-text-2); text-align: left; cursor: pointer; }
.mode-picker button:hover { color: var(--vp-c-text-1); }
.mode-picker button.active { border-color: var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-1); box-shadow: 0 1px 3px rgb(0 0 0 / 5%); }
.mode-picker span { font-size: 11px; font-weight: 700; }
.mode-picker small { color: var(--vp-c-text-3); font-size: 9px; }
.setup-panel { display: flex; flex-direction: column; gap: 14px; padding: 17px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--tool-surface-alt, var(--vp-c-bg-alt)); }
.panel-heading { margin-bottom: 1px; }
.panel-heading h3 { margin: 0 !important; font-size: 14px !important; }
.panel-heading p { margin: 2px 0 0; color: var(--vp-c-text-3); font-size: 11px; }
.field { display: grid; gap: 6px; margin: 0; }
.field > span:first-child, .field-label-row { color: var(--vp-c-text-2); font-size: 11px; font-weight: 650; }
.field input, .field select { box-sizing: border-box; width: 100%; min-height: 42px; padding: 9px 11px; border: 1px solid var(--vp-c-divider); border-radius: 8px; outline: none; background: var(--vp-c-bg); color: var(--vp-c-text-1); font: 13px var(--vp-font-family-base); transition: border-color .15s, box-shadow .15s; }
.field input:focus, .field select:focus { border-color: var(--vp-c-brand-1); box-shadow: 0 0 0 3px var(--vp-c-brand-soft); }
.field input::placeholder { color: var(--vp-c-text-3); }
.field.has-error input { border-color: var(--vp-c-danger-1); }
.field small { color: var(--vp-c-danger-1); font-size: 10px; }
.field em { color: var(--vp-c-text-3); font-size: 10px; font-style: normal; }
.field i { color: var(--vp-c-text-3); font-weight: 400; font-style: normal; }
.field-label-row { display: flex; justify-content: space-between; gap: 10px; }
.field-label-row a { color: var(--vp-c-brand-1); font-weight: 500; text-decoration: none; }
.input-action { position: relative; display: block; }
.input-action input { padding-right: 44px; }
.input-action button { position: absolute; top: 5px; right: 5px; height: 32px; padding: 0 8px; border: 0; border-radius: 6px; background: transparent; color: var(--vp-c-text-3); font-size: 10px; font-weight: 700; cursor: pointer; }
.input-action button:hover { background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); }
.input-action svg { width: 17px; fill: none; stroke: currentColor; stroke-width: 1.5; }
.input-action--text input { padding-right: 88px; font-family: var(--vp-font-family-mono); font-size: 11px; }
.torbox-referral { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-top: auto; padding-top: 11px; border-top: 1px solid var(--vp-c-divider); color: inherit; text-decoration: none !important; }
.torbox-referral > span:first-child { display: grid; }
.torbox-referral strong { font-size: 11px; }
.torbox-referral small { color: var(--vp-c-text-3); font-size: 9px; }
.torbox-referral > span:last-child { color: var(--vp-c-brand-1); font-size: 10px; font-weight: 700; white-space: nowrap; }
.advanced { grid-column: 1 / -1; padding: 14px; border: 1px solid var(--vp-c-divider); border-radius: 10px; }
.advanced-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 13px; }
.advanced-heading h3 { margin: 0 !important; font-size: 12px !important; }
.advanced-heading p { margin: 2px 0 0; color: var(--vp-c-text-3); font-size: 10px; }
.advanced-heading > span { padding: 3px 7px; border-radius: 999px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-3); font-size: 9px; }
.advanced-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.advanced-catalog { grid-column: 1 / -1; }
.advanced-password { grid-column: 1 / -1; }
.advanced-fields > p { grid-column: 1 / -1; margin: 0; color: var(--vp-c-text-2); font-size: 11px; }
.form-footer { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 25px; padding-top: 2px; }
.form-footer p { margin: 0; max-width: 620px; color: var(--vp-c-text-3); font-size: 10px; line-height: 1.4; }
.primary-action { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 42px; padding: 0 17px; border: 0; border-radius: 8px; background: var(--vp-c-brand-1); color: white; font-size: 12px; font-weight: 700; white-space: nowrap; cursor: pointer; }
.primary-action:hover { background: var(--vp-c-brand-2); }
.primary-action:disabled { opacity: .6; cursor: wait; }
.primary-action svg { width: 16px; fill: none; stroke: currentColor; stroke-width: 2; }
.state-view { max-width: 760px; margin: 0 auto; padding: 54px 20px; }
.state-heading { display: flex; align-items: center; gap: 17px; }
.state-heading p { margin: 4px 0 0; color: var(--vp-c-text-2); font-size: 12px; }
.loader { width: 38px; height: 38px; border: 2px solid var(--vp-c-divider); border-top-color: var(--vp-c-brand-1); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.step-track { display: grid; grid-template-columns: repeat(5, 1fr); padding: 0; margin: 38px 0 0; list-style: none; }
.step-track li { position: relative; display: grid; justify-items: center; gap: 9px; color: var(--vp-c-text-3); font-size: 10px; text-align: center; }
.step-track li:not(:last-child)::after { content: ''; position: absolute; top: 5px; left: calc(50% + 8px); width: calc(100% - 16px); height: 1px; background: var(--vp-c-divider); }
.step-track i { z-index: 1; width: 11px; height: 11px; border: 2px solid var(--vp-c-divider); border-radius: 50%; background: var(--vp-c-bg); }
.step-track li.active { color: var(--vp-c-text-1); font-weight: 700; }
.step-track li.active i { border-color: var(--vp-c-brand-1); }
.step-track li.done i { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-1); }
.result-view { text-align: center; }
.success-icon { display: grid; place-items: center; width: 42px; height: 42px; margin: 0 auto 13px; border-radius: 50%; background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.success-icon svg { width: 22px; fill: none; stroke: currentColor; stroke-width: 2.3; }
.result-view > p { margin: 7px auto 25px; }
.result-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 12px; text-align: left; }
.result-grid section { padding: 14px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--tool-surface-alt, var(--vp-c-bg-alt)); }
.result-label { display: block; margin-bottom: 8px; color: var(--vp-c-text-2); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
.copy-row { display: flex; overflow: hidden; border: 1px solid var(--vp-c-divider); border-radius: 7px; background: var(--vp-c-bg); }
.copy-row input { flex: 1; min-width: 0; padding: 9px; border: 0; outline: 0; background: transparent; color: var(--vp-c-text-2); font: 10px var(--vp-font-family-mono); }
.copy-row button { border: 0; background: var(--vp-c-brand-1); color: white; padding: 0 12px; font-size: 10px; font-weight: 700; cursor: pointer; }
.credentials > p { margin: -4px 0 8px; color: var(--vp-c-text-3); font-size: 9px; }
.credentials dl { display: grid; grid-template-columns: auto 1fr; gap: 5px 12px; margin: 0; font-size: 10px; }
.credentials dt { color: var(--vp-c-text-3); }
.credentials dd { min-width: 0; margin: 0; overflow-wrap: anywhere; text-align: right; }
.credentials code { color: var(--vp-c-text-1); font-size: 9px; }
.result-actions { display: flex; justify-content: center; gap: 9px; margin-top: 16px; }
.result-actions a, .result-actions button { min-height: 38px; padding: 0 14px; border-radius: 7px; font-size: 11px; font-weight: 700; cursor: pointer; }
.result-actions a { display: inline-flex; align-items: center; border: 1px solid var(--vp-c-brand-1); background: var(--vp-c-brand-1); color: white; text-decoration: none; }
.result-actions button { border: 1px solid var(--vp-c-divider); background: transparent; color: var(--vp-c-text-1); }
button:focus-visible, a:focus-visible, summary:focus-visible, input:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
@media (max-width: 760px) {
  .quickstart-body { padding: 17px; }
  .quickstart-intro { align-items: flex-start; }
  .setup-summary { min-width: 0; }
  .setup-form, .result-grid { grid-template-columns: 1fr; }
  .advanced-fields { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .quickstart-intro { display: block; }
  .setup-summary { justify-content: flex-start; margin-top: 13px; }
  .secure-pill { width: auto; justify-content: flex-start; }
  .form-footer { align-items: stretch; flex-direction: column-reverse; gap: 10px; }
  .primary-action { width: 100%; }
  .step-track { grid-template-columns: 1fr; gap: 13px; margin-top: 28px; }
  .step-track li { grid-template-columns: 13px 1fr; justify-items: start; text-align: left; }
  .step-track li:not(:last-child)::after { top: 12px; bottom: -14px; left: 5px; width: 1px; height: auto; }
  .result-actions { flex-direction: column; }
  .result-actions a { justify-content: center; }
  .quickstart-tip { flex-direction: column; gap: 2px; }
}
</style>
