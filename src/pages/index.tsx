// SPA (Single Page Application, modelo que não é reconhecido nos mecanismos de busca do Google -> informações carregadas depois que o usuário acessa a página)

// SSR (Server Side Rendering, atualiza e busca as informações toda vez que o usuário entra na página -> informações disponíveis assim que a página é mostrada ao usuário)

// SSG (Static Site Generation, atualiza e busca as informações em um determinado intervalo de tempo. Ex.: A cada 8 horas o usuário tem as informações atualizadas -> informações disponíveis assim que a página é mostrada ao usuário)

//Exemplo de SSG -> Atenção: Esse modelo só funciona se estiver em Produção ('yarn start' ao invés de 'yarn dev')

import { GetStaticProps } from 'next';

import Image from 'next/image'

import Link from 'next/link';

import { api } from '../services/api';

import { format, parseISO} from 'date-fns';

import ptBR from 'date-fns/locale/pt-BR';

import Head from 'next/head';

import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContents';


type Episode = {
    id: string;
    title: string;
    members: string;
    url: string;
    publishedAt: string;
    duration: number;
    durationAsString: string;
    thumbnail: string;
}

type HomeProps = {
  latestEpisodes: Episode[]; //ou Array<Episode>;
  allEpisodes: Episode[]; //ou Array<Episode>;
}

export default function Home({latestEpisodes, allEpisodes}: HomeProps) {
  
  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];
  
  return (
    <div className={styles.homePage}>

    <Head>
      <title>Home | Podcastr</title>
    </Head>

    <section className={styles.latestEpisodes}>
      <h2>Últimos lançamentos</h2>
      <ul>
        {latestEpisodes.map((episode, index) => {
            return(
              <li key={episode.id}>
                
                <Image //Usamos o 'Image' ou invés da tag '<img/>' porque assim podemos dizer o tamanho que queremos que nossas imagens sejam carregadas -> Obs.: carregar a imagem é diferente de apresentar a imagem, por isso o 'width={192}' é diferente de 'width="500px"' 

                //-> Nesse último caso ('width="500px"') se a imagem tivesse 1920px, seria carregado todo esses 1920 pixels, deixando o site mais lento -> Se não usarmos realmente todo o tamanho da imagem (o que geralmente acontece), é importante utilizar o 'Image' do next.js

                width={250}
                height={250}
                src={episode.thumbnail} 
                alt="{episode.title}" 
                //objectFit é usado pra definir uma melhor visualização de uma imagem que foi mudada de tamanho, no caso, não deixá-la distorcida
                objectFit="cover"/> 


                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}> 
                  <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar Episódio"/>
                </button>
              </li>
            )
        })}
      </ul>
    </section>

    <section className={styles.allEpisodes}>
      
      <h2>Todos os episódios</h2>

      <table cellSpacing={0}>
        <thead>
          <tr>
            <th></th>
            <th>Podcast</th>
            <th>Integrantes</th>
            <th>Data</th>
            <th>Duração</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {allEpisodes.map((episode, index) =>{
          return(
            <tr key={episode.id}>
              <td style={{width: 40}}>
                <Image
                  width={120}
                  height={120}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                />
              </td>
              <td>
              <Link href={`/episodes/${episode.id}`}>
                <a>{episode.title}</a>
              </Link>
              </td>
              <td>{episode.members}</td>
              <td style={{width: 100}}>{episode.publishedAt}</td>
              <td>{episode.durationAsString}</td>
              <td>
                <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </td>
            </tr>
          )
          })}
        </tbody>
      </table>
    </section>
    </div>
  )
}

export const getStaticProps : GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc',
    }
  }) //limit: limite por tela = 12; sort (busca la no server.json o published_at): ordenar pela data de publicação; order: ordem decrescente 
  
  const episodes = data.map(episode =>{
    return{
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,

      //Para mudar o formato que veio do server.json 
      publishedAt: format(parseISO(episode.published_at), 
      'd MMM yy', { locale: ptBR}), 
      duration: Number(episode.file.duration), 
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,     
    };
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length); 

  return{
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8, //60 segundos * 60 minutos * 8 horas -> como ele é contado em segundos, para gerar nova versão a cada 8 horas precisa ser feito dessa maneira
  }
}

//Exemplo de SPA

/*
import { useEffect } from "react"

export default function Home() {

  useEffect(() => {
    fetch('http://localhost:3333/episodes')
      .then(response => response.json())
      .then(data => console.log(data)) 
  }, [])

  return (
    <h1>Index</h1>
  )
}
*/



//Exemplo de SSR

/*
export default function Home(props) {
  return (
    <div>
    <h1>Index</h1>

    //Para mostrar como se fosse um 'console.log(), só que na página
    <p>{JSON.stringify(props.episodes)}</p>
    </div>
  )
}

export async function getServerSideProps(){
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()

  return{
    props: {
      episodes: data
    }
  }
}
*/

