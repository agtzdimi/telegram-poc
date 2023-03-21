import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";

/** Logged in user data */
interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

type LOGIN_BUTTON_SIZE = "medium" | "large" | "small";

/** Configuration for a login button */
interface WidgetConfiguration {
  // Login button size. Default: large
  buttonStyle?: LOGIN_BUTTON_SIZE;
  // Show user photo near the button. Default: true
  showUserPhoto?: boolean;
  // Radius of buttons corners(0-20). Default: 20
  cornerRadius?: number;
  // Request for write access. Default: false
  accessToWriteMessages?: boolean;
}

const TELEGRAM_WIDGET_VERSION = 21;

@Component({
  selector: "bet-bez-telegram-login-btn",
  styleUrls: ["./product-list.component.css"],
  template: "<div #scriptContainer></div>",
})
export class ProductListComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild("scriptContainer", { static: true }) scriptContainer:
    | ElementRef
    | undefined;

  @Output() login: EventEmitter<User> = new EventEmitter<User>();
  @Output() loaded: EventEmitter<void> = new EventEmitter<void>();
  @Output() loadError: EventEmitter<void> = new EventEmitter<void>();

  private _botName = "botfather321321bot";
  private _config?: WidgetConfiguration = {
    showUserPhoto: true,
    accessToWriteMessages: true,
  };

  private readonly window: any;
  private readonly document: Document;

  private defaultConfigs = {
    src: `https://telegram.org/js/telegram-widget.js?${TELEGRAM_WIDGET_VERSION}`,
    "data-onauth": `onTelegramLogin(user)`,
    onerror: `onTelegramWidgetLoadFail()`,
    onload: `onTelegramWidgetLoad()`,
  };
  script: HTMLScriptElement | undefined;

  @HostListener("window:data-onauth", ["$event"])
  loginAuth(event: any) {
    console.log(event);
  }

  constructor(private ngZone: NgZone, @Inject(DOCUMENT) document: any) {
    this.window = window;
    this.document = document as Document;
  }

  ngOnInit() {
    this.window["onTelegramLogin"] = (data: User | undefined) => {
      console.log(data);
      this.ngZone.run(() => {
        console.log(data);
        this.login.emit(data);
      });
    };
    this.window["onTelegramWidgetLoad"] = () =>
      this.ngZone.run(() => {
        console.log("EE");
        this.loaded.emit();
      });
    this.window["onTelegramWidgetLoadFail"] = () =>
      this.ngZone.run(() => {
        console.log("AA");
        this.loadError.emit();
      });
  }

  ngAfterViewInit() {
    const scriptAttrs: any = this._compileConfigs();
    this.script = this.document.createElement("script");

    for (const key in scriptAttrs) {
      console.log(key, scriptAttrs[key]);
      if (scriptAttrs[key]) {
        this.script.setAttribute(key, scriptAttrs[key]);
      }
    }

    this.script.setAttribute("async", "");

    if (this.scriptContainer) this.scriptContainer.nativeElement.innerHTML = "";
    this.scriptContainer?.nativeElement.appendChild(this.script);
    console.log(this.script);
    console.log(this.window["onTelegramLogin"]);
  }

  ngOnDestroy() {
    if (this.script) {
      this.script.remove();
    }
  }

  private _compileConfigs(): object {
    const configs: any = this.defaultConfigs ?? {};

    if (!this._botName) {
      throw new Error("Telegram widget: bot name not present!");
    }

    configs["data-telegram-login"] = this._botName;

    if (this._config?.accessToWriteMessages) {
      configs["data-request-access"] = "write";
    }

    if (this._config?.cornerRadius) {
      configs["data-radius"] = `${this._config.cornerRadius}`;
    }

    if (this._config?.showUserPhoto === false) {
      configs["data-userpic"] = "false";
    }

    if (this._config?.buttonStyle) {
      configs["data-size"] = this._config.buttonStyle;
    } else {
      configs["data-size"] = "large";
    }

    return configs;
  }
}
