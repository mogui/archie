// Cash
import $ from "cash-dom";
import { ResponseType, fetch } from '@tauri-apps/api/http';

// -- Tauri -- 
import { BaseDirectory, readTextFile, writeBinaryFile } from '@tauri-apps/api/fs';
import { message } from '@tauri-apps/api/dialog';
import { Command } from '@tauri-apps/api/shell'
import { appDataDir } from '@tauri-apps/api/path';
import { Store } from "tauri-plugin-store-api";


class ConfigManager {

  private store:Store;
  
  constructor(store:Store) {
    this.store = store;
  };

  static async create() {
    const appDataDirPath = await appDataDir();
    let store = new Store(`${appDataDirPath}settings.dat`);
    return new ConfigManager(store);
  }

  public async set(key:string, val:any) {
    await this.store.set(key, val);
  }

  public async save() {
    await this.store.save();
  }

  public get(key:string) {
    return this.store.get(key);
  }
}

interface Asset {
  browser_download_url?: string;
  content_type?: string;
  name?: string;
}

interface Release {
  prerelease?: boolean;
  name?: string;
  assets?: Array<Asset>
}

window.addEventListener("DOMContentLoaded", async () => {
  $('#loader').hide();
  let settings = await ConfigManager.create();
  settings.get('plantuml')
    .then((result)=>{
      if(result != null){
        $('#plantuml-jar').val(result as string);
      }
    }, (error)=>{
      console.log(error);
  });

  $('#plantuml-jar-btn').on('click', async (event) => {
    event.preventDefault();
    $('#loader').show();
    $('#plantuml-jar-btn').attr('disabled', 'true');  
    const response = await fetch('https://api.github.com/repos/plantuml/plantuml/releases', {
      headers: {
        "User-Agent": "archie"
      },
      method: 'GET',
    });
    const releases: Array<Release> = response.data as Array<Release>;
    const latest = releases.filter((elem)=> elem.prerelease == false )[0];
    const asset = latest.assets?.filter((el)=> el.content_type == "application/x-java-archive" && el.name == `plantuml-${latest.name?.replace('v','')}.jar`) as Array<Asset>;
    const downlaodUrl = asset[0].browser_download_url as string;
    
    fetch(downlaodUrl, {
      method: 'GET', 
      responseType: ResponseType.Binary,
      headers: {
        "User-Agent": "archie"
      }
    })
    .then( async response => {
      const appDataDirPath = await appDataDir();
      const plantumlJarPath = `${appDataDirPath}plantuml.jar`
      new Command('create-dir', ['-p', appDataDirPath]);
      await writeBinaryFile({ path: 'plantuml.jar', contents: response.data as Uint8Array }, { dir: BaseDirectory.AppData });
      $('#loader').hide();
      $('#plantuml-jar-btn').removeAttr('disabled');
      $('#plantuml-jar').val(plantumlJarPath);
      await settings.set('plantuml', plantumlJarPath);
      await settings.save();
      // await message(asd as string, {type: "error", okLabel: "ok"});
    })
    .catch(async error => {
      console.error(error);
      await message(error, {type: "error", okLabel: "ok"});
    });
  });

});